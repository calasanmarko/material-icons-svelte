const path = require('path')
const material = require('material-icons-json/dist/icons.json')
const { pascalCase } = require('pascal-case')
const fs = require('fs-extra')

const handleComponentName = name => name.replace(/\-(\d+)/, '$1').match(/^\d/) ? `Material${name}` : name

const component = (icon) =>
`<script>
  export let size = "24";
  export let strokeWidth = 0;
  let customClass = "";
  export { customClass as class };

  if (size !== "100%") {
    size = size.slice(-1) === 'x' 
          ? size.slice(0, size.length -1) + 'em'
          : parseInt(size) + 'px';
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" stroke-width="{strokeWidth}" class="material material-${icon.name} {customClass}">${material[icon.name]}</svg>
`

const icons = Object.keys(material).map(name => ({
  name,
  pascalCasedComponentName: pascalCase(`${handleComponentName(name)}-icon`),
  kebabCasedComponentName: `${handleComponentName(name)}-icon`
}))

Promise.all(icons.map(icon => {
  const baseFilepath = `./dist/${icon.pascalCasedComponentName}`;
  const svelteFilepath = `${baseFilepath}.svelte`;
  const typeFilepath = `${baseFilepath}.d.ts`;

  return fs.ensureDir(path.dirname(baseFilepath))
    .then(() => fs.writeFileSync(svelteFilepath, component(icon), 'utf8'))
    .then(() => fs.writeFileSync(typeFilepath, '/// <reference types="svelte" />\nimport {SvelteComponentTyped} from "svelte/internal"\nexport class ' + icon.pascalCasedComponentName + ' extends SvelteComponentTyped<{size?: string, strokeWidth?: number, class?: string}> {}', 'utf8'))
}));