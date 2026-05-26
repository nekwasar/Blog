# Route and Console Menu Generation

## Overview

Routes and menus are dynamically generated from three parts: base routes, core module routes, and plugin module routes.

Definition file locations:

- Base routes: `src/router/routes.config.ts`
- Core module routes: `src/modules/**/module.ts`

## Definition Method

All routes are defined using the `definePlugin` method from the `@halo-dev/ui-shared` package:

```ts
import { definePlugin } from "@halo-dev/ui-shared";
import BasicLayout from "@console/layouts/BasicLayout.vue";
import AttachmentList from "./AttachmentList.vue";
import AttachmentSelectorModal from "./components/AttachmentSelectorModal.vue";
import { IconFolder } from "@halo-dev/components";
import { markRaw } from "vue";

export default definePlugin({
  name: "attachmentModule",
  components: [AttachmentSelectorModal],
  routes: [
    {
      path: "/attachments",
      component: BasicLayout,
      children: [
        {
          path: "",
          name: "Attachments",
          component: AttachmentList,
          meta: {
            title: "Attachments",
            permissions: ["system:attachments:view"],
            menu: {
              name: "Attachments",
              group: "content",
              icon: markRaw(IconFolder),
              priority: 3,
              mobile: true,
            },
          },
        },
      ],
    },
  ],
});
```

To add routes to the sidebar menu, define the `menu` object in `meta`:

```ts
interface RouteMeta {
  title?: string;
  searchable?: boolean;
  permissions?: string[];
  core?: boolean;
  menu?: {
    name: string;               // Menu display name
    group?: CoreMenuGroupId;    // Menu group ID
    icon?: Component;           // Menu icon (Vue component)
    priority: number;           // Sort order (plugin menus always come last)
    mobile?: boolean;           // Show on mobile bottom nav
  };
}
```

CoreMenuGroupId:

```ts
declare type CoreMenuGroupId = "dashboard" | "content" | "interface" | "system" | "tool";
```

For custom plugin groups, use any string:

```ts
{
  name: "Posts",
  group: "Community",
  icon: markRaw(IconCommunity),
  priority: 1,
  mobile: false,
}
```

## Plugin Integration

The definition approach is identical to core modules. If a plugin route needs the basic layout (extending BasicLayout), set `parentName`:

```ts
export default definePlugin({
  routes: [
    {
      parentName: "Root",
      route: {
        path: "/migrate",
        children: [
          {
            path: "",
            name: "Migrate",
            component: MigrateView,
            meta: {
              title: "Migrate",
              searchable: true,
              menu: {
                name: "Migrate",
                group: "tool",
                icon: markRaw(IconGrid),
                priority: 0,
              },
            },
          },
        ],
      },
    },
  ]
})
```

## Permissions

Configure `permissions` in `meta` as an array of UI permission identifiers, e.g., `["system:attachments:view"]`. If the current user lacks the permission, the route and menu are not registered.
