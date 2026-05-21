import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const doctorSource = readFileSync(
	new URL("./doctor.ts", import.meta.url),
	"utf8",
);

assert.match(
	doctorSource,
	/"pi-subagents"/,
	"pf-doctor should still check the pi-subagents optional package",
);

const deprecatedPackage = "@tintinweb" + "/pi-subagents";

assert.equal(
	doctorSource.includes(deprecatedPackage),
	false,
	"pf-doctor should not check or print the deprecated tintinweb subagents package",
);
