# Sims3-Installer-Redux

A custom electron based installer for The Sims 3 and all expansion/stuff packs. Intended to make reinstallation of The Sims 3 from the original install discs easier and faster. This project was created as a UI design exercise to recreate the Sims 3 Launcher aesthetic in HTML/CSS.

_**NOTICE:** This installer does not contain any game files and is not intended for piracy. You'll need to supply your own game data from your original game discs to use this installer._

## :mag: Requirements

* Your original game discs for _The Sims 3_ and any expansion/stuff packs you own.

* A copy of the [Electron binaries for Windows](https://github.com/electron/electron/releases/download/v18.3.1/electron-v18.3.1-win32-x64.zip)

## :electric_plug: Setup

1. From the _/resources/app_ directory, run `npm install` to install project dependencies.

2. Download the [Electron binary](https://github.com/electron/electron/releases/download/v18.3.1/electron-v18.3.1-win32-x64.zip) and drop it in the root project folder after removing the sample _/resources/default_app.asar_ file that's included with the binaries.

   2b. Alternatively, you can install electron from NPM using `npm install electron` from the _/resources/app_ directory and then run the project with `npm start`. If you run via NPM, you'll need to move the game data directory from _/data_ to _/resources/app/data_.

3. Install The Sims 3 and any expansions you want from the original game discs. You'll only have to do this once to prepare the game data for use with this installer since they can't be legally included with the project.

4. Navigate to the install directory for your Sims 3 game data _(usually C:\Program Files (x86)\Electronic Arts)_.

5. Package the base game and each expansion/stuff pack into separate zip files following the naming structure below. Each zip should contain the install folder for the game/content pack and its contents. eg: _Base.zip/The Sims 3/*_, _EP05.zip/The Sims 3 Pets/*_. The easiest way to do this is with 7Zip or WinRAR by right clicking the folder, choosing "Add to archive..." and selecting zip as the format.

<table align="center">
<tr></tr>
<tr><td>

| ZIP Name      | Content Pack |
| ------------- | ------------- |
| Base.zip  | The Sims 3 Base Game  |
| EP01.zip  | The Sims 3 World Adventures  |
| EP02.zip  | The Sims 3 Ambitions  |
| EP03.zip  | The Sims 3 Late Night  |
| EP04.zip  | The Sims 3 Generations  |
| EP05.zip  | The Sims 3 Pets  |
| EP06.zip  | The Sims 3 Showtime  |
| EP07.zip  | The Sims 3 Supernatural  |
| EP08.zip  | The Sims 3 Seasons  |
| EP09.zip  | The Sims 3 University Life  |
| EP10.zip  | The Sims 3 Island Paradise  |
| EP11.zip  | The Sims 3 Into the Future  |

</td><td valign="top">

| ZIP Name      | Content Pack |
| ------------- | ------------- |
| SP01.zip  | The Sims 3 High-End Loft Stuff  |
| SP02.zip  | The Sims 3 Fast Lane Stuff  |
| SP03.zip  | The Sims 3 Outdoor Living Stuff  |
| SP04.zip  | The Sims 3 Town Life Stuff  |
| SP05.zip  | The Sims 3 Master Suite Stuff  |
| SP06.zip  | The Sims 3 Katy Perry's Sweet Treats  |
| SP07.zip  | The Sims 3 Diesel Stuff  |
| SP08.zip  | The Sims 3 70s, 80s & 90's Stuff  |
| SP09.zip  | The Sims 3 Movie Stuff  |

</td></tr> </table>

6. From the project root directory, drop the game data zips you created into _/data_ (or _resources/app/data_ if running via npm).

## :information_source: Usage

Run the electron executable from the project's root directory, or run `npm start` from the _/resources/app_ directory if running via npm.

## :bangbang:	Known Issues

Since this project was created as a design exercise, not all functionally is fully implemented or production ready.

* The installer will silently fail to import registry data if it is not run as administrator.
* Some registry imports for certain content packs are unimplemented. Some content packs won't run due to missing registry keys.
  * You can fix this issue by adding the missing registry keys/values in _/resources/app/registry.json_
* Game data is currently extracted to _/data/test_ and cannot be set from the installer GUI.
  * You can change the extraction path in [_/resources/app/renderer.js:129_](https://github.com/Maega/Sims3-Installer-Redux/blob/main/resources/app/renderer.js#L129)
    * If not installing to _C:\Program Files (x86)\Electronic Arts_, also change the reg import directory at [_/resources/app/renderer.js:166_](https://github.com/Maega/Sims3-Installer-Redux/blob/main/resources/app/renderer.js#L166)

## :heart: Support

If you'd like to support ongoing development of this project, a donation would be very much appreciated to help me dedicate more of my time making AutoVirt a reality. I accept direct crypto donations via any of the addresses below or through [Coinbase Commerce](https://commerce.coinbase.com/checkout/bb4f7665-bfdc-4c22-9fc8-78299010b1c8).

**BTC:** bc1q6kqv5u2368j4l00rls5frg78wt7m6vf7a50sa7

**ETH:** 0x704fb3fD106D00e6D78880C25139141C4B24DFd7

**DOGE:** D6MZp3HMZQA6gFBhmcmYs6AjytXwQJ4bYj

**LTC:** ltc1qhqgsnzwumxm7q3u3m4rj0zcvwcvcvhqqrke07p

**XMR:** 8429Hzck9gdX43MF9NzNGjaeGdKBwjVTjgGDQfXKV6WxfSGubxuBi6mEh2nDWwXtAZUjMejV4Pamr5SfYp96QJZNEQecMqS
