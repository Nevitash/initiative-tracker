# Initiative Tracker _(initiative-tracker)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

TTRPG initiative and encounter tracker plugin for Obsidian.md.

Initiative Tracker is an Obsidian plugin that manages initiative, creature stats, and turn order during tabletop roleplaying combat encounters directly inside markdown notes.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

Running tabletop RPG combats while maintaining campaign notes inside Obsidian requires seamless in-app encounter tooling. This plugin allows GMs to create encounter codeblocks, manage active HP and Armor Class, calculate creature XP, and seamlessly integrate with SRD and Fantasy Statblocks plugins.

## Install

### Obsidian Community Plugins

1. In Obsidian Settings, open **Community Plugins**.
2. Search for `Initiative Tracker`.
3. Click **Install**, then **Enable**.

### Manual Development Build

Requires Node.js:

```bash
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` into your Obsidian vault's `.obsidian/plugins/initiative-tracker/` folder.

## Usage

Insert an initiative tracker code block into any Obsidian markdown note:

````markdown
```initiative
```
````

Add creatures and encounter combatants through the UI controls or note parameters to begin tracking turns and health points.

## Maintainers

Fork maintained by [@Nevitash](https://github.com/Nevitash).
Upstream author: [@javalent](https://github.com/javalent).

## Contributing

PRs are welcome. For significant features or breaking changes, please open an issue first.

## License

[GNU General Public License v3.0](LICENSE)