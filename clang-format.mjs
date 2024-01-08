import { execSync } from "child_process";
import { exit } from "process";
import {error, log} from "console"
import process from "process";

const args = ["--Werror", "-i", "--style=file", "bindings/cpu_profiler.cc"];
const cmd  = `./node_modules/.bin/clang-format ${args.join(" ")}`;

execSync(cmd)
