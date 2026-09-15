declare module '*.astro' {
  type AstroComponentFactory = (props: Record<string, unknown>) => unknown;
  const component: AstroComponentFactory;
  export default component;
}
