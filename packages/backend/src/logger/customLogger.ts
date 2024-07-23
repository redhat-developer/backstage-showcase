import {
  createConfigSecretEnumerator,
  WinstonLogger,
} from '@backstage/backend-app-api';
import { DynamicPluginsSchemasService } from '@backstage/backend-dynamic-feature-service';
import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { loadConfigSchema } from '@backstage/config-loader';
import { getPackages } from '@manypkg/get-packages';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const defaultFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
);

const auditLogFormat = winston.format((info, opts) => {
  const { isAuditLog, ...newInfo } = info;

  if (isAuditLog) {
    // keep `isAuditLog` field
    return opts.isAuditLog ? info : false;
  }

  // remove `isAuditLog` field from non audit log events
  return !opts.isAuditLog ? newInfo : false;
});

const auditLogWinstonFormat = winston.format.combine(
  auditLogFormat({ isAuditLog: false }),
  defaultFormat,
  winston.format.json(),
);

const transports = {
  log: [
    new winston.transports.Console({
      format: winston.format.combine(
        auditLogFormat({ isAuditLog: false }),
        defaultFormat,
        winston.format.json(),
      ),
    }),
  ],
  auditLog: (config?: Config) => {
    if (config?.getOptionalBoolean('logToConsole.enabled') === false) {
      return [];
    }
    return [
      new winston.transports.Console({
        format: auditLogWinstonFormat,
      }),
    ];
  },
  auditLogFile: (config?: Config) => {
    if (!config?.getOptionalBoolean('rotate.enabled')) {
      return [];
    }
    return [
      new winston.transports.DailyRotateFile({
        format: auditLogWinstonFormat,
        dirname:
          config?.getOptionalString('rotate.logFileDirPath') ||
          '/var/log/redhat-developer-hub/audit',
        filename:
          config?.getOptionalString('rotate.logFileName') ||
          'redhat-developer-hub-audit-%DATE%.log',
        datePattern: config?.getOptionalString('rotate.dateFormat'),
        frequency: config?.getOptionalString('rotate.frequency'),
        zippedArchive: config?.getOptionalBoolean('rotate.zippedArchive'),
        utc: config?.getOptionalBoolean('rotate.utc'),
        maxSize: config?.getOptionalString('rotate.maxSize'),
        maxFiles: config?.getOptional('rotate.maxFilesOrDays'),
      }),
    ];
  },
};

const dynamicPluginsSchemasServiceRef =
  createServiceRef<DynamicPluginsSchemasService>({
    id: 'core.dynamicplugins.schemas',
    scope: 'root',
  });

export const customLogger = createServiceFactory({
  service: coreServices.rootLogger,
  deps: {
    config: coreServices.rootConfig,
    schemas: dynamicPluginsSchemasServiceRef,
  },
  async factory({ config, schemas }) {
    const auditLogConfig = config.getOptionalConfig('auditLog');
    const logger = WinstonLogger.create({
      meta: {
        service: 'backstage',
      },
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(defaultFormat, winston.format.json()),
      transports: [
        ...transports.log,
        ...transports.auditLog(auditLogConfig),
        ...transports.auditLogFile(auditLogConfig),
      ],
    });

    const configSchema = await loadConfigSchema({
      dependencies: (await getPackages(process.cwd())).packages.map(
        p => p.packageJson.name,
      ),
    });

    const secretEnumerator = await createConfigSecretEnumerator({
      logger,
      schema: (await schemas.addDynamicPluginsSchemas(configSchema)).schema,
    });
    logger.addRedactions(secretEnumerator(config));
    config.subscribe?.(() => logger.addRedactions(secretEnumerator(config)));

    return logger;
  },
});
