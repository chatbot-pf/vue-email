import { defineComponent } from "vue";
//#region src/components/e-body/e-body.tsx
const marginProperties = [
	"margin",
	"marginTop",
	"marginBottom",
	"marginRight",
	"marginLeft",
	"marginInline",
	"marginBlock",
	"marginBlockStart",
	"marginBlockEnd",
	"marginInlineStart",
	"marginInlineEnd"
];
const paddingProperties = [
	"padding",
	"paddingTop",
	"paddingBottom",
	"paddingRight",
	"paddingLeft",
	"paddingInline",
	"paddingBlock",
	"paddingBlockStart",
	"paddingBlockEnd",
	"paddingInlineStart",
	"paddingInlineEnd"
];
const EBody = defineComponent({
	name: "EBody",
	inheritAttrs: false,
	render() {
		const { style, ...attrs } = this.$attrs;
		const bodyStyle = {
			background: style?.background,
			backgroundColor: style?.backgroundColor
		};
		if (style) for (const property of [...marginProperties, ...paddingProperties]) bodyStyle[property] = style[property] !== void 0 ? 0 : void 0;
		const cleanBodyStyle = Object.fromEntries(Object.entries(bodyStyle).filter(([, v]) => v !== void 0));
		return <body {...attrs} style={Object.keys(cleanBodyStyle).length > 0 ? cleanBodyStyle : void 0}>
        <table border={0} width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center">
          <tbody>
            <tr>
              <td style={style}>{this.$slots.default?.()}</td>
            </tr>
          </tbody>
        </table>
      </body>;
	}
});
//#endregion
//#region src/components/e-button/utils.ts
/**
* Converts a CSS padding value to its px equivalent number.
* - px: direct passthrough
* - em/rem: multiply by 16
* - %: percentage of 600 (email container width)
* - other/invalid: 0
*/
function convertToPx(value) {
	if (!value && value !== 0) return 0;
	if (typeof value === "number") return value;
	const matches = /^([\d.]+)(px|em|rem|%)$/.exec(value);
	if (matches && matches.length === 3) {
		const numValue = Number.parseFloat(matches[1]);
		switch (matches[2]) {
			case "px": return numValue;
			case "em":
			case "rem": return numValue * 16;
			case "%": return numValue / 100 * 600;
			default: return numValue;
		}
	}
	return 0;
}
function parsePaddingValue(value) {
	if (typeof value === "number") return {
		paddingTop: value,
		paddingRight: value,
		paddingBottom: value,
		paddingLeft: value
	};
	if (typeof value === "string" && value.trim().length > 0) {
		const values = value.trim().split(/\s+/);
		if (values.length === 1) return {
			paddingTop: values[0],
			paddingRight: values[0],
			paddingBottom: values[0],
			paddingLeft: values[0]
		};
		if (values.length === 2) return {
			paddingTop: values[0],
			paddingRight: values[1],
			paddingBottom: values[0],
			paddingLeft: values[1]
		};
		if (values.length === 3) return {
			paddingTop: values[0],
			paddingRight: values[1],
			paddingBottom: values[2],
			paddingLeft: values[1]
		};
		if (values.length === 4) return {
			paddingTop: values[0],
			paddingRight: values[1],
			paddingBottom: values[2],
			paddingLeft: values[3]
		};
	}
	return {
		paddingTop: void 0,
		paddingRight: void 0,
		paddingBottom: void 0,
		paddingLeft: void 0
	};
}
/**
* Parses all padding properties from a style object into individual px values.
* Handles both shorthand `padding` and explicit `paddingTop/Right/Bottom/Left`.
* Explicit properties override shorthand.
*/
function parsePadding(properties) {
	let paddingTop;
	let paddingRight;
	let paddingBottom;
	let paddingLeft;
	for (const [key, value] of Object.entries(properties)) if (key === "padding") ({paddingTop, paddingRight, paddingBottom, paddingLeft} = parsePaddingValue(value));
	else if (key === "paddingTop") paddingTop = value;
	else if (key === "paddingRight") paddingRight = value;
	else if (key === "paddingBottom") paddingBottom = value;
	else if (key === "paddingLeft") paddingLeft = value;
	return {
		paddingTop: paddingTop != null ? convertToPx(paddingTop) : void 0,
		paddingRight: paddingRight != null ? convertToPx(paddingRight) : void 0,
		paddingBottom: paddingBottom != null ? convertToPx(paddingBottom) : void 0,
		paddingLeft: paddingLeft != null ? convertToPx(paddingLeft) : void 0
	};
}
/**
* Converts pixels to points: pt = px * 3 / 4
*/
function pxToPt(px) {
	return typeof px === "number" && !Number.isNaN(Number(px)) ? px * 3 / 4 : void 0;
}
const maxFontWidth = 5;
/**
* Computes a mso-font-width (<=500%) and a count of hair-space characters
* that together produce a horizontal padding as close to `expectedWidth` px as possible.
* This is used for MSO/Outlook compatibility.
*/
function computeFontWidthAndSpaceCount(expectedWidth) {
	if (expectedWidth === 0) return [0, 0];
	let smallestSpaceCount = 0;
	const computeRequiredFontWidth = () => {
		if (smallestSpaceCount > 0) return expectedWidth / smallestSpaceCount / 2;
		return Number.POSITIVE_INFINITY;
	};
	while (computeRequiredFontWidth() > maxFontWidth) smallestSpaceCount++;
	return [computeRequiredFontWidth(), smallestSpaceCount];
}
//#endregion
//#region src/components/e-button/e-button.tsx
const EButton = defineComponent({
	name: "EButton",
	inheritAttrs: false,
	props: {
		href: {
			type: String,
			default: void 0
		},
		target: {
			type: String,
			default: "_blank"
		},
		style: {
			type: Object,
			default: void 0
		}
	},
	setup(props, { attrs, slots }) {
		return () => {
			const { paddingTop, paddingRight, paddingBottom, paddingLeft } = parsePadding(props.style ?? {});
			const textRaise = pxToPt((paddingTop ?? 0) + (paddingBottom ?? 0));
			const [plFontWidth, plSpaceCount] = computeFontWidthAndSpaceCount(paddingLeft ?? 0);
			const [prFontWidth, prSpaceCount] = computeFontWidthAndSpaceCount(paddingRight ?? 0);
			const anchorStyle = {
				lineHeight: "100%",
				textDecoration: "none",
				display: "inline-block",
				maxWidth: "100%",
				msoPaddingAlt: "0px",
				...props.style,
				...paddingTop != null ? { paddingTop: `${paddingTop}px` } : {},
				...paddingRight != null ? { paddingRight: `${paddingRight}px` } : {},
				...paddingBottom != null ? { paddingBottom: `${paddingBottom}px` } : {},
				...paddingLeft != null ? { paddingLeft: `${paddingLeft}px` } : {}
			};
			const leftMsoHtml = `<!--[if mso]><i style="mso-font-width:${plFontWidth * 100}%;mso-text-raise:${textRaise}" hidden>${"&#8202;".repeat(plSpaceCount)}</i><![endif]-->`;
			const rightMsoHtml = `<!--[if mso]><i style="mso-font-width:${prFontWidth * 100}%" hidden>${"&#8202;".repeat(prSpaceCount)}&#8203;</i><![endif]-->`;
			const middleSpanStyle = {
				maxWidth: "100%",
				display: "inline-block",
				lineHeight: "120%",
				msoPaddingAlt: "0px",
				msoTextRaise: pxToPt(paddingBottom)
			};
			return <a href={props.href} target={props.target} style={anchorStyle} {...attrs}>
          <span innerHTML={leftMsoHtml} />
          <span style={middleSpanStyle}>{slots.default?.()}</span>
          <span innerHTML={rightMsoHtml} />
        </a>;
		};
	}
});
//#endregion
//#region src/components/e-column/e-column.tsx
const EColumn = defineComponent({
	name: "EColumn",
	inheritAttrs: false,
	props: { style: {
		type: [String, Object],
		default: void 0
	} },
	setup(props, { attrs, slots }) {
		return () => {
			const { ...restAttrs } = attrs;
			return <td data-id="__react-email-column" style={props.style} {...restAttrs}>
          {slots.default?.()}
        </td>;
		};
	}
});
//#endregion
//#region src/components/e-container/e-container.tsx
const EContainer = defineComponent({
	name: "EContainer",
	inheritAttrs: false,
	render() {
		const { style, ...attrs } = this.$attrs;
		return <table align="center" width="100%" {...attrs} border={0} cellPadding="0" cellSpacing="0" role="presentation" style={{
			maxWidth: "37.5em",
			...style
		}}>
        <tbody>
          <tr style={{ width: "100%" }}>
            <td>{this.$slots.default?.()}</td>
          </tr>
        </tbody>
      </table>;
	}
});
//#endregion
//#region src/components/e-font/e-font.tsx
const EFont = defineComponent({
	name: "EFont",
	inheritAttrs: false,
	props: {
		fontFamily: {
			type: String,
			required: true
		},
		fallbackFontFamily: {
			type: [String, Array],
			required: true
		},
		webFont: {
			type: Object,
			default: void 0
		},
		fontStyle: {
			type: String,
			default: "normal"
		},
		fontWeight: {
			type: [Number, String],
			default: 400
		}
	},
	render() {
		const src = this.webFont ? `src: url(${this.webFont.url}) format('${this.webFont.format}');` : "";
		const fallback = this.fallbackFontFamily;
		const msoFallback = Array.isArray(fallback) ? fallback[0] : fallback;
		const fallbackList = Array.isArray(fallback) ? fallback.join(", ") : fallback;
		const css = `
    @font-face {
      font-family: '${this.fontFamily}';
      font-style: ${this.fontStyle};
      font-weight: ${this.fontWeight};
      mso-font-alt: '${msoFallback}';
      ${src}
    }

    * {
      font-family: '${this.fontFamily}', ${fallbackList};
    }
  `;
		return <style innerHTML={css} />;
	}
});
//#endregion
//#region src/components/e-head/e-head.tsx
const EHead = defineComponent({
	name: "EHead",
	inheritAttrs: false,
	render() {
		return <head {...this.$attrs}>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        {this.$slots.default?.()}
      </head>;
	}
});
//#endregion
//#region src/components/e-heading/e-heading.tsx
function withSpace(value, properties) {
	const styles = {};
	if (value === void 0) return styles;
	if (Number.isNaN(Number.parseFloat(String(value)))) return styles;
	for (const property of properties) styles[property] = `${value}px`;
	return styles;
}
function withMargin(props) {
	const candidates = [
		withSpace(props.m, ["margin"]),
		withSpace(props.mx, ["marginLeft", "marginRight"]),
		withSpace(props.my, ["marginTop", "marginBottom"]),
		withSpace(props.mt, ["marginTop"]),
		withSpace(props.mr, ["marginRight"]),
		withSpace(props.mb, ["marginBottom"]),
		withSpace(props.ml, ["marginLeft"])
	];
	const mergedStyles = {};
	for (const style of candidates) if (Object.keys(style).length > 0) Object.assign(mergedStyles, style);
	return mergedStyles;
}
function parseStyleString$1(style) {
	if (!style) return {};
	const result = {};
	for (const declaration of style.split(";")) {
		const [prop, ...rest] = declaration.split(":");
		if (prop && rest.length > 0) {
			const camelProp = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
			result[camelProp] = rest.join(":").trim();
		}
	}
	return result;
}
const EHeading = defineComponent({
	name: "EHeading",
	inheritAttrs: false,
	props: {
		as: {
			type: String,
			default: "h1"
		},
		m: {
			type: [Number, String],
			default: void 0
		},
		mx: {
			type: [Number, String],
			default: void 0
		},
		my: {
			type: [Number, String],
			default: void 0
		},
		mt: {
			type: [Number, String],
			default: void 0
		},
		mr: {
			type: [Number, String],
			default: void 0
		},
		mb: {
			type: [Number, String],
			default: void 0
		},
		ml: {
			type: [Number, String],
			default: void 0
		},
		style: {
			type: [String, Object],
			default: void 0
		}
	},
	render() {
		const Tag = this.as;
		const styleObj = typeof this.style === "string" ? parseStyleString$1(this.style) : this.style ?? {};
		const computedStyle = {
			...withMargin({
				m: this.m,
				mx: this.mx,
				my: this.my,
				mt: this.mt,
				mr: this.mr,
				mb: this.mb,
				ml: this.ml
			}),
			...styleObj
		};
		return <Tag {...this.$attrs} style={computedStyle}>
        {this.$slots.default?.()}
      </Tag>;
	}
});
//#endregion
//#region src/components/e-hr/e-hr.tsx
const EHr = defineComponent({
	name: "EHr",
	inheritAttrs: false,
	render() {
		const { style, ...restAttrs } = this.$attrs;
		const mergedStyle = {
			width: "100%",
			border: "none",
			borderTop: "1px solid #eaeaea",
			...style
		};
		return <hr {...restAttrs} style={mergedStyle} />;
	}
});
//#endregion
//#region src/components/e-html/e-html.tsx
const EHtml = defineComponent({
	name: "EHtml",
	inheritAttrs: false,
	props: {
		lang: {
			type: String,
			default: "en"
		},
		dir: {
			type: String,
			default: "ltr"
		}
	},
	render() {
		return <html {...this.$attrs} lang={this.lang} dir={this.dir}>
        {this.$slots.default?.()}
      </html>;
	}
});
//#endregion
//#region src/components/e-img/e-img.tsx
const defaultStyle$1 = {
	display: "block",
	outline: "none",
	border: "none",
	textDecoration: "none"
};
const EImg = defineComponent({
	name: "EImg",
	inheritAttrs: false,
	props: {
		src: {
			type: String,
			default: void 0
		},
		alt: {
			type: String,
			default: void 0
		},
		width: {
			type: [Number, String],
			default: void 0
		},
		height: {
			type: [Number, String],
			default: void 0
		},
		style: {
			type: [String, Object],
			default: void 0
		}
	},
	setup(props, { attrs }) {
		return () => {
			const styleBinding = props.style ? [defaultStyle$1, props.style] : defaultStyle$1;
			return <img src={props.src} alt={props.alt} width={props.width} height={props.height} style={styleBinding} {...attrs} />;
		};
	}
});
//#endregion
//#region src/components/e-link/e-link.tsx
const defaultStyle = {
	color: "#067df7",
	textDecorationLine: "none"
};
const ELink = defineComponent({
	name: "ELink",
	inheritAttrs: false,
	props: {
		href: {
			type: String,
			default: void 0
		},
		target: {
			type: String,
			default: "_blank"
		},
		style: {
			type: [String, Object],
			default: void 0
		}
	},
	setup(props, { attrs, slots }) {
		return () => {
			const styleBinding = props.style ? [defaultStyle, props.style] : defaultStyle;
			return <a href={props.href} target={props.target} style={styleBinding} {...attrs}>
          {slots.default?.()}
        </a>;
		};
	}
});
//#endregion
//#region src/components/e-preview/e-preview.tsx
const PREVIEW_MAX_LENGTH = 150;
const WHITE_SPACE_CODES = "\xA0‌​‍‎‏﻿";
function renderWhiteSpace(text) {
	if (text.length >= PREVIEW_MAX_LENGTH) return null;
	return <div>{WHITE_SPACE_CODES.repeat(PREVIEW_MAX_LENGTH - text.length)}</div>;
}
const EPreview = defineComponent({
	name: "EPreview",
	inheritAttrs: false,
	render() {
		const slotContent = this.$slots.default?.();
		let text = "";
		if (slotContent && slotContent.length > 0) text = slotContent.map((vnode) => {
			if (typeof vnode.children === "string") return vnode.children;
			return String(vnode.children ?? "");
		}).join("");
		const truncated = text.substring(0, PREVIEW_MAX_LENGTH);
		return <div style={{
			display: "none",
			overflow: "hidden",
			lineHeight: "1px",
			opacity: 0,
			maxHeight: 0,
			maxWidth: 0
		}} data-skip-in-text="true" {...this.$attrs}>
        {truncated}
        {renderWhiteSpace(truncated)}
      </div>;
	}
});
//#endregion
//#region src/components/e-row/e-row.tsx
const ERow = defineComponent({
	name: "ERow",
	inheritAttrs: false,
	render() {
		return <table align="center" width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation" {...this.$attrs}>
        <tbody style={{ width: "100%" }}>
          <tr style={{ width: "100%" }}>{this.$slots.default?.()}</tr>
        </tbody>
      </table>;
	}
});
//#endregion
//#region src/components/e-section/e-section.tsx
const ESection = defineComponent({
	name: "ESection",
	inheritAttrs: false,
	render() {
		return <table align="center" width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation" {...this.$attrs}>
        <tbody>
          <tr>
            <td>{this.$slots.default?.()}</td>
          </tr>
        </tbody>
      </table>;
	}
});
//#endregion
//#region src/components/e-text/e-text.tsx
function parseMarginValue(value) {
	if (typeof value === "number") return {
		marginTop: value,
		marginBottom: value,
		marginLeft: value,
		marginRight: value
	};
	if (typeof value === "string") {
		const values = value.trim().split(/\s+/);
		if (values.length === 1) return {
			marginTop: values[0],
			marginBottom: values[0],
			marginLeft: values[0],
			marginRight: values[0]
		};
		if (values.length === 2) return {
			marginTop: values[0],
			marginRight: values[1],
			marginBottom: values[0],
			marginLeft: values[1]
		};
		if (values.length === 3) return {
			marginTop: values[0],
			marginRight: values[1],
			marginBottom: values[2],
			marginLeft: values[1]
		};
		if (values.length === 4) return {
			marginTop: values[0],
			marginRight: values[1],
			marginBottom: values[2],
			marginLeft: values[3]
		};
	}
	return {
		marginTop: void 0,
		marginBottom: void 0,
		marginLeft: void 0,
		marginRight: void 0
	};
}
function computeMargins(properties) {
	let result = {
		marginTop: void 0,
		marginRight: void 0,
		marginBottom: void 0,
		marginLeft: void 0
	};
	for (const [key, value] of Object.entries(properties)) if (key === "margin") result = parseMarginValue(value);
	else if (key === "marginTop") result.marginTop = value;
	else if (key === "marginRight") result.marginRight = value;
	else if (key === "marginBottom") result.marginBottom = value;
	else if (key === "marginLeft") result.marginLeft = value;
	return result;
}
function parseStyleString(style) {
	const result = {};
	for (const declaration of style.split(";")) {
		const colonIdx = declaration.indexOf(":");
		if (colonIdx === -1) continue;
		const prop = declaration.slice(0, colonIdx).trim();
		const val = declaration.slice(colonIdx + 1).trim();
		if (!prop || !val) continue;
		const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
		result[camelProp] = val;
	}
	return result;
}
const EText = defineComponent({
	name: "EText",
	inheritAttrs: false,
	render() {
		const rawAttrs = this.$attrs;
		const attrStyle = rawAttrs.style;
		let styleObj = {};
		if (typeof attrStyle === "string") styleObj = parseStyleString(attrStyle);
		else if (attrStyle && typeof attrStyle === "object") styleObj = attrStyle;
		const defaultMargins = {};
		if (styleObj.marginTop === void 0 && styleObj.margin === void 0) defaultMargins.marginTop = "16px";
		if (styleObj.marginBottom === void 0 && styleObj.margin === void 0) defaultMargins.marginBottom = "16px";
		const margins = computeMargins({
			...defaultMargins,
			...styleObj
		});
		const { margin: _m, marginTop: _mt, marginRight: _mr, marginBottom: _mb, marginLeft: _ml, ...nonMarginStyle } = styleObj;
		const computedStyle = {
			fontSize: "14px",
			lineHeight: "24px",
			...nonMarginStyle,
			...margins
		};
		const attrsWithoutStyle = {};
		for (const [key, val] of Object.entries(rawAttrs)) if (key !== "style") attrsWithoutStyle[key] = val;
		return <p {...attrsWithoutStyle} style={computedStyle}>
        {this.$slots.default?.()}
      </p>;
	}
});
//#endregion
export { EBody, EButton, EColumn, EContainer, EFont, EHead, EHeading, EHr, EHtml, EImg, ELink, EPreview, ERow, ESection, EText };

//# sourceMappingURL=index.mjs.map