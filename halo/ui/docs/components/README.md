# Console Component Overview

Console components include base components (`@halo-dev/components`) and Console-specific business components. Both can be used in plugins.

## Business Components

### AnnotationsForm

Used to set annotations data on custom models. Supports custom key/value pairs and custom forms. See: <https://docs.halo.run/developer-guide/annotations-form>

Usage:

```vue
<script setup lang="ts">
const formState = ref({
  metadata: {
    annotations: {}
  }
})

const annotationsFormRef = ref();

async function handleSubmit () {
  annotationsFormRef.value?.handleSubmit();

  await nextTick();

  const { customAnnotations, annotations, customFormInvalid, specFormInvalid } =
    annotationsFormRef.value || {};

  // Skip submission if AnnotationsForm validation fails
  if (customFormInvalid || specFormInvalid) {
    return;
  }

  // Merge data — this object can be set as metadata.annotations
  const annotations = {
    ...annotations,
    ...customAnnotations,
  }
}
</script>

<template>
  <AnnotationsForm
    ref="annotationsFormRef"
    :value="formState.metadata.annotations"
    kind="Post"
    group="content.halo.run"
  />
</template>
```

Both `kind` and `group` are required, representing the model's kind and group.
