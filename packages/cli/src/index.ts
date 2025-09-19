#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./commands/init";
import { add } from "./commands/add";

const program = new Command();

program.name("dora-styles").description("Customizable CSS styling library").version("0.1.0");
program.command("init").description("Initialize Dora styles in your project").action(init);

program.command("add <component>").description("Add a component (e.g. button, card)").action(add);

program.parse(process.argv);
