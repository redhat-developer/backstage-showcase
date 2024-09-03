#!/bin/bash
set -a  # Automatically export all variables

#ENVS and Vault Secrets
HELM_CHART_VALUE_FILE_NAME="values_showcase.yaml"
HELM_CHART_RBAC_VALUE_FILE_NAME="values_showcase-rbac.yaml"
HELM_IMAGE_NAME=backstage
HELM_REPO_NAME=rhdh-chart
HELM_REPO_URL="https://redhat-developer.github.io/rhdh-chart"
K8S_CLUSTER_TOKEN_ENCODED=$(echo -n $K8S_CLUSTER_TOKEN | base64 | tr -d '\n')
QUAY_REPO="${QUAY_REPO:-janus-idp/backstage-showcase}"

RELEASE_NAME=rhdh
RELEASE_NAME_RBAC=rhdh-rbac
NAME_SPACE="${NAME_SPACE:-showcase}"
NAME_SPACE_RBAC="${NAME_SPACE_RBAC:-showcase-rbac}"
NAME_SPACE_POSTGRES_DB="${NAME_SPACE_POSTGRES_DB:-postgress-external-db}"
CHART_VERSION="2.15.2"
GITHUB_APP_APP_ID=Mzc2ODY2
GITHUB_APP_CLIENT_ID=SXYxLjdiZDNlZDFmZjY3MmY3ZDg=
GITHUB_APP_PRIVATE_KEY=$(cat /tmp/secrets/GITHUB_APP_PRIVATE_KEY)
GITHUB_APP_CLIENT_SECRET=$(cat /tmp/secrets/GITHUB_APP_CLIENT_SECRET)
GITHUB_APP_JANUS_TEST_APP_ID=OTE3NjM5
GITHUB_APP_JANUS_TEST_CLIENT_ID=SXYyM2xpSEdtU1l6SUFEbHFIakw=
GITHUB_APP_JANUS_TEST_PRIVATE_KEY=$(cat /tmp/secrets/GITHUB_APP_JANUS_TEST_PRIVATE_KEY)
GITHUB_APP_JANUS_TEST_CLIENT_SECRET=$(cat /tmp/secrets/GITHUB_APP_JANUS_TEST_CLIENT_SECRET)
GITHUB_APP_WEBHOOK_URL=aHR0cHM6Ly9zbWVlLmlvL0NrRUNLYVgwNzhyZVhobEpEVzA=
GITHUB_APP_WEBHOOK_SECRET=$(cat /tmp/secrets/GITHUB_APP_WEBHOOK_SECRET)
GITHUB_URL=aHR0cHM6Ly9naXRodWIuY29t
GITHUB_ORG=amFudXMtcWU=
GITHUB_ORG_2=amFudXMtdGVzdA==
GH_USER_ID=$(cat /tmp/secrets/GH_USER_ID)
GH_USER_PASS=$(cat /tmp/secrets/GH_USER_PASS)
GH_2FA_SECRET=$(cat /tmp/secrets/GH_2FA_SECRET)
GH_RHDH_QE_USER_TOKEN=$(cat /tmp/secrets/GH_RHDH_QE_USER_TOKEN)

GITLAB_TOKEN=$(cat /tmp/secrets/GITLAB_TOKEN)

K8S_CLUSTER_API_SERVER_URL=$(echo -n "$K8S_CLUSTER_URL" | base64 | tr -d '\n')
K8S_SERVICE_ACCOUNT_TOKEN=$K8S_CLUSTER_TOKEN_ENCODED
OCM_CLUSTER_URL=$(echo -n "$K8S_CLUSTER_URL" | base64 | tr -d '\n')
OCM_CLUSTER_TOKEN=$K8S_CLUSTER_TOKEN_ENCODED
KEYCLOAK_BASE_URL='https://keycloak-keycloak.rhdh-pr-os-a9805650830b22c3aee243e51d79565d-0000.us-east.containers.appdomain.cloud'
KEYCLOAK_LOGIN_REALM='myrealm'
KEYCLOAK_REALM='myrealm'
KEYCLOAK_CLIENT_ID='myclient'
KEYCLOAK_CLIENT_SECRET=$(cat /tmp/secrets/KEYCLOAK_CLIENT_SECRET)
ACR_SECRET=$(cat /tmp/secrets/ACR_SECRET)
DH_TARGET_URL=aHR0cDovL3Rlc3QtYmFja3N0YWdlLWN1c3RvbWl6YXRpb24tcHJvdmlkZXItc2hvd2Nhc2UtY2kucmhkaC1wci1vcy1hOTgwNTY1MDgzMGIyMmMzYWVlMjQzZTUxZDc5NTY1ZC0wMDAwLnVzLWVhc3QuY29udGFpbmVycy5hcHBkb21haW4uY2xvdWQ=
GOOGLE_CLIENT_ID=$(cat /tmp/secrets/GOOGLE_CLIENT_ID)
GOOGLE_CLIENT_SECRET=$(cat /tmp/secrets/GOOGLE_CLIENT_SECRET)
GOOGLE_ACC_COOKIE=$(cat /tmp/secrets/GOOGLE_ACC_COOKIE)
GOOGLE_USER_ID=$(cat /tmp/secrets/GOOGLE_USER_ID)
GOOGLE_USER_PASS=$(cat /tmp/secrets/GOOGLE_USER_PASS)
GOOGLE_2FA_SECRET=$(cat /tmp/secrets/GOOGLE_2FA_SECRET)

DATA_ROUTER_URL=$(cat /tmp/secrets/DATA_ROUTER_URL)
DATA_ROUTER_USERNAME=$(cat /tmp/secrets/DATA_ROUTER_USERNAME)
DATA_ROUTER_PASSWORD=$(cat /tmp/secrets/DATA_ROUTER_PASSWORD)
DATA_ROUTER_PROJECT="main"
REPORTPORTAL_HOSTNAME=$(cat /tmp/secrets/REPORTPORTAL_HOSTNAME)
NEXUS_HOSTNAME=$(cat /tmp/secrets/NEXUS_HOSTNAME)
REDIS_TEMP_USER=temp
REDIS_TEMP_PASS=test123

# used for auth_providers scenarios
RHSSO76_ADMIN_USERNAME=$(cat /tmp/secrets/RHSSO76_ADMIN_USERNAME)
RHSSO76_ADMIN_PASSWORD=$(cat /tmp/secrets/RHSSO76_ADMIN_PASSWORD)
RHSSO76_DEFAULT_PASSWORD=$(cat /tmp/secrets/RHSSO76_DEFAULT_PASSWORD)
RHSSO76_CLIENT_SECRET=$(cat /tmp/secrets/RHSSO76_CLIENT_SECRET)
AZURE_LOGIN_USERNAME=$(cat /tmp/secrets/AZURE_LOGIN_USERNAME)
AZURE_LOGIN_PASSWORD=$(cat /tmp/secrets/AZURE_LOGIN_PASSWORD)
AUTH_PROVIDERS_AZURE_CLIENT_ID=$(cat /tmp/secrets/AUTH_PROVIDERS_AZURE_CLIENT_ID)
AUTH_PROVIDERS_AZURE_CLIENT_SECRET=$(cat /tmp/secrets/AUTH_PROVIDERS_AZURE_CLIENT_SECRET)
AUTH_PROVIDERS_AZURE_TENANT_ID=$(cat /tmp/secrets/AUTH_PROVIDERS_AZURE_TENANT_ID)
AUTH_PROVIDERS_GH_ORG_CLIENT_ID=$(cat /tmp/secrets/AUTH_PROVIDERS_GH_ORG_CLIENT_ID)
AUTH_PROVIDERS_GH_ORG_CLIENT_SECRET=$(cat /tmp/secrets/AUTH_PROVIDERS_GH_ORG_CLIENT_SECRET)

RHSSO76_BASE_URL=aHR0cHM6Ly9rZXljbG9hay1yaHNzby5yaGRoLXByLW9zLWE5ODA1NjUwODMwYjIyYzNhZWUyNDNlNTFkNzk1NjVkLTAwMDAudXMtZWFzdC5jb250YWluZXJzLmFwcGRvbWFpbi5jbG91ZC9hdXRo
RHSSO76_METADATA_URL=aHR0cHM6Ly9rZXljbG9hay1yaHNzby5yaGRoLXByLW9zLWE5ODA1NjUwODMwYjIyYzNhZWUyNDNlNTFkNzk1NjVkLTAwMDAudXMtZWFzdC5jb250YWluZXJzLmFwcGRvbWFpbi5jbG91ZC9hdXRoL3JlYWxtcy9hdXRoUHJvdmlkZXJz
RHSSO76_CLIENT_ID=bXljbGllbnQ=
RHSSO76_CALLBACK_URL=""
AUTH_PROVIDERS_REALM_NAME=YXV0aFByb3ZpZGVycw==
AUTH_PROVIDERS_GH_ORG_NAME=""

set +a  # Stop automatically exporting variables
