import { execSync } from "child_process";
import { exit } from "process";
import {error} from "console"
import process from "process";

const args = ["--Werror", "--style=file", "bindings/cpu_profiler.cc"];

if(process.argv.includes("--fix")){
    // Edit in place
    args.unshift("-i")
}

const out = execSync(
  `clang-format ${args.join(" ")}`,
  {stdio: "inherit"}
);

console.log(out)
