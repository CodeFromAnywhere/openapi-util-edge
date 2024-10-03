This is actually a very useful thing to have:

A cli that can generate code based on predefined context and prompt.

This can then be ran automatically before pushing.

The cli or vscode extension can maybe be made in a way that it would not immediately overwrite, but show the difference with the previous version, and allow the user to press decline/accept.

This can be its own repo and standalone cli.

Some things I could do:

- generate endpoint from description (using tool)
- generate openapi from all endpoints
- generate openapi from description
- generate frontend html files from openapi

For each of these there's always input file(s), tool(s), and output file(s), and maybe an additional message.
