# Git Log Report

A command line tool to get commits for the current author grouped by day.

## Usage

```bash
npx git-log-report [options]
```

## Options

- `-h, --help` : Display help message
- `-o, --output <directory>` : Output directory (default: ./output)
- `-s, --since  <date>` : Show commits since date (format: YYYY-MM-DD or YYYY-MM-DD HH:MM)
- `-u, --until  <date>` : Show commits until date (format: YYYY-MM-DD or YYYY-MM-DD HH:MM)

## Examples

```bash
npx git-log-report --since='2024-03-20' --until='2024-03-22' --output='./output_directory'
```

## How it Works

This tool retrieves commits for the current author grouped by day. It takes into account the provided options such as date range and output directory.

## Installation

You can use this tool directly via npx:

```bash
npx git-log-report [options]
```

## Dependencies

- `child_process`: Used for executing Git commands.
- `fs`: Used for file system operations.
- `path`: Used for manipulating file paths.
- `minimist`: Used for parsing command-line arguments.
- `chalk`: Used for terminal text styling.
