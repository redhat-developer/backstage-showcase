import {
  Link,
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
} from '@backstage/core-components';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { css } from '@emotion/css';
import CreateComponentIcon from '@mui/icons-material/AddCircleOutline';
import AppsIcon from '@mui/icons-material/Apps';
import ExtensionIcon from '@mui/icons-material/Extension';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/MyLocation';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import React, { PropsWithChildren } from 'react';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';

const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  return (
    <Link
      to="/"
      underline="none"
      aria-label="Home"
      className={css`
        margin: 24px 0px 6px 24px;
      `}
    >
      {isOpen ? <LogoFull /> : <LogoIcon />}
    </Link>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon as any} to="/" text="Home" />
        <SidebarItem icon={AppsIcon as any} to="catalog" text="Catalog" />
        <SidebarItem icon={ExtensionIcon as any} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks as any} to="docs" text="Docs" />
        <SidebarItem
          icon={SchoolIcon as any}
          to="learning-paths"
          text="Learning Paths"
        />
        <SidebarItem icon={StorageIcon as any} to="ocm" text="Clusters" />
        <SidebarItem
          icon={CreateComponentIcon as any}
          to="create"
          text="Create..."
        />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          <SidebarItem
            icon={MapIcon as any}
            to="tech-radar"
            text="Tech Radar"
          />
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
