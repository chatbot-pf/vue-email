import * as vue from "vue";
import { CSSProperties } from "vue";
import * as vue_jsx_runtime0 from "vue/jsx-runtime";

//#region src/components/e-body/e-body.d.ts
declare const EBody: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-button/e-button.d.ts
declare const EButton: vue.DefineComponent<vue.ExtractPropTypes<{
  href: {
    type: StringConstructor;
    default: undefined;
  };
  target: {
    type: StringConstructor;
    default: string;
  };
  style: {
    type: () => CSSProperties;
    default: undefined;
  };
}>, () => vue_jsx_runtime0.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  href: {
    type: StringConstructor;
    default: undefined;
  };
  target: {
    type: StringConstructor;
    default: string;
  };
  style: {
    type: () => CSSProperties;
    default: undefined;
  };
}>> & Readonly<{}>, {
  style: CSSProperties;
  href: string;
  target: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-column/e-column.d.ts
declare const EColumn: vue.DefineComponent<vue.ExtractPropTypes<{
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>, () => vue_jsx_runtime0.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>> & Readonly<{}>, {
  style: string | CSSProperties;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-container/e-container.d.ts
declare const EContainer: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-font/e-font.d.ts
type FallbackFont = 'Arial' | 'Helvetica' | 'Verdana' | 'Georgia' | 'Times New Roman' | 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy';
type FontFormat = 'woff' | 'woff2' | 'truetype' | 'opentype' | 'embedded-opentype' | 'svg';
type FontWeight = number | string;
type FontStyle = 'normal' | 'italic' | 'oblique' | (string & {});
declare const EFont: vue.DefineComponent<vue.ExtractPropTypes<{
  fontFamily: {
    type: StringConstructor;
    required: true;
  };
  fallbackFontFamily: {
    type: () => FallbackFont | FallbackFont[];
    required: true;
  };
  webFont: {
    type: () => {
      url: string;
      format: FontFormat;
    } | undefined;
    default: undefined;
  };
  fontStyle: {
    type: () => FontStyle;
    default: string;
  };
  fontWeight: {
    type: () => FontWeight;
    default: number;
  };
}>, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  fontFamily: {
    type: StringConstructor;
    required: true;
  };
  fallbackFontFamily: {
    type: () => FallbackFont | FallbackFont[];
    required: true;
  };
  webFont: {
    type: () => {
      url: string;
      format: FontFormat;
    } | undefined;
    default: undefined;
  };
  fontStyle: {
    type: () => FontStyle;
    default: string;
  };
  fontWeight: {
    type: () => FontWeight;
    default: number;
  };
}>> & Readonly<{}>, {
  webFont: {
    url: string;
    format: FontFormat;
  } | undefined;
  fontStyle: FontStyle;
  fontWeight: FontWeight;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-head/e-head.d.ts
declare const EHead: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-heading/e-heading.d.ts
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
declare const EHeading: vue.DefineComponent<vue.ExtractPropTypes<{
  as: {
    type: () => HeadingTag;
    default: string;
  };
  m: {
    type: () => number | string;
    default: undefined;
  };
  mx: {
    type: () => number | string;
    default: undefined;
  };
  my: {
    type: () => number | string;
    default: undefined;
  };
  mt: {
    type: () => number | string;
    default: undefined;
  };
  mr: {
    type: () => number | string;
    default: undefined;
  };
  mb: {
    type: () => number | string;
    default: undefined;
  };
  ml: {
    type: () => number | string;
    default: undefined;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  as: {
    type: () => HeadingTag;
    default: string;
  };
  m: {
    type: () => number | string;
    default: undefined;
  };
  mx: {
    type: () => number | string;
    default: undefined;
  };
  my: {
    type: () => number | string;
    default: undefined;
  };
  mt: {
    type: () => number | string;
    default: undefined;
  };
  mr: {
    type: () => number | string;
    default: undefined;
  };
  mb: {
    type: () => number | string;
    default: undefined;
  };
  ml: {
    type: () => number | string;
    default: undefined;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>> & Readonly<{}>, {
  style: string | CSSProperties;
  as: HeadingTag;
  m: string | number;
  mx: string | number;
  my: string | number;
  mt: string | number;
  mr: string | number;
  mb: string | number;
  ml: string | number;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-hr/e-hr.d.ts
declare const EHr: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-html/e-html.d.ts
declare const EHtml: vue.DefineComponent<vue.ExtractPropTypes<{
  lang: {
    type: StringConstructor;
    default: string;
  };
  dir: {
    type: StringConstructor;
    default: string;
  };
}>, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  lang: {
    type: StringConstructor;
    default: string;
  };
  dir: {
    type: StringConstructor;
    default: string;
  };
}>> & Readonly<{}>, {
  lang: string;
  dir: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-img/e-img.d.ts
declare const EImg: vue.DefineComponent<vue.ExtractPropTypes<{
  src: {
    type: StringConstructor;
    default: undefined;
  };
  alt: {
    type: StringConstructor;
    default: undefined;
  };
  width: {
    type: (StringConstructor | NumberConstructor)[];
    default: undefined;
  };
  height: {
    type: (StringConstructor | NumberConstructor)[];
    default: undefined;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>, () => vue_jsx_runtime0.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  src: {
    type: StringConstructor;
    default: undefined;
  };
  alt: {
    type: StringConstructor;
    default: undefined;
  };
  width: {
    type: (StringConstructor | NumberConstructor)[];
    default: undefined;
  };
  height: {
    type: (StringConstructor | NumberConstructor)[];
    default: undefined;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>> & Readonly<{}>, {
  style: string | CSSProperties;
  src: string;
  alt: string;
  width: string | number;
  height: string | number;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-link/e-link.d.ts
declare const ELink: vue.DefineComponent<vue.ExtractPropTypes<{
  href: {
    type: StringConstructor;
    default: undefined;
  };
  target: {
    type: StringConstructor;
    default: string;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>, () => vue_jsx_runtime0.JSX.Element, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
  href: {
    type: StringConstructor;
    default: undefined;
  };
  target: {
    type: StringConstructor;
    default: string;
  };
  style: {
    type: () => string | CSSProperties;
    default: undefined;
  };
}>> & Readonly<{}>, {
  style: string | CSSProperties;
  href: string;
  target: string;
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-preview/e-preview.d.ts
declare const EPreview: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-row/e-row.d.ts
declare const ERow: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-section/e-section.d.ts
declare const ESection: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/e-text/e-text.d.ts
declare const EText: vue.DefineComponent<{}, {}, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;
//#endregion
export { EBody, EButton, EColumn, EContainer, EFont, EHead, EHeading, EHr, EHtml, EImg, ELink, EPreview, ERow, ESection, EText };
//# sourceMappingURL=index.d.mts.map