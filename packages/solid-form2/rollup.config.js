import withSolid from "rollup-preset-solid";

export default withSolid({
	input: "src/index.tsx",
	targets: ["esm", "cjs"],
	external: ["solid-js", "@kildevaeld/form","@kildevaeld/form/dom", "@kildevaeld/model", "@solid-primitives/trigger"],
});
