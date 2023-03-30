<p align="center">
[![build-test](https://github.com/post-op/chatgpt-release/actions/workflows/test.yml/badge.svg)](https://github.com/post-op/chatgpt-release/actions/workflows/test.yml)
</p>

# Create a release body from commit messages

This action asks ChatGPT to create a release message from your commit messages.

## Requirements

This action requires an OpenAI token in the environment variable OPENAI_TOKEN

## Usage

Add the following entry to your Github workflow YAML file with the required inputs.

```
uses: post-op/chatgpt-release@v1
with:
  version: 'v1.0.23'
```

## Action Inputs

| Input | Required | Description |
| --- | --- | --- |
| `version` | Yes | The version number or release name (string) |
| `whimsical` | No | Whether to create a plain release text or a whimsical one (boolean) |
| `sha` | No | The starting sha or committish for getting commit messages. uses the latest release as base or the whole of main if there are no releases (string) |
| `project_name` | No | The project name to communicate to ChatGPT, uses the repo name if not set (string) |

## Build and Test this Action Locally

1. Install the dependencies:

```bash
$ npm install
```

2. Build the typescript and package it for distribution: 

```bash
$ npm run build && npm run package
```

3. Run the tests:

```bash
$ npm test

 PASS  ./index.test.js

...
```