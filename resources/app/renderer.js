const ipc = require('electron').ipcRenderer;
const remote = require('@electron/remote');
const win = remote.getCurrentWindow();
const fs = require('fs-extra');
const $ = require('jquery');
const Swal = require('sweetalert2');
const StreamZip = require('node-stream-zip');
const regedit = require('regedit').promisified;
const registryData = require('./registry.json');

// Initialise music
const NebulaAudio = require('./audio');
const audio = new NebulaAudio('./audio/theme1.mp3');
audio.loop = true;
audio.play();
audio._audio.onplay = () => $('.controlbtn.togglemusic').removeClass('muted');
audio._audio.onpause = () => $('.controlbtn.togglemusic').addClass('muted');

// onclick event handler for pack option
$(document).on('click', '.pack', function() {
    if (!$(this).hasClass('required')) $(this).toggleClass('selected');
    updateInfo();
});

function updateInfo() {
    const selectedPacks = $('.pack.selected');
    $('#numPacksToInstall').text(selectedPacks.length);

    let totalSize = 0;
    selectedPacks.each((index, pack) => {
        totalSize += parseFloat($(pack).data('size'));
    });
    $('#sizeRequired').text(totalSize.toFixed(1));
}

updateInfo();

const messages = require('./messages.json');
function randomMsg(packId) {

    // If message is already in transition, return immediately
    if ($('#currentMessage').hasClass('change')) return;

    const validMessages = messages[packId] || messages.Base;
    const selectedIndex = Math.floor(Math.random() * validMessages.length);
    
    $('#currentMessage').addClass('change');
    setTimeout(() => $('#currentMessage').text(validMessages[selectedIndex]), 1000);
    setTimeout(() => $('#currentMessage').removeClass('change'), 2000);

}

async function startInstall() {

    audio.loop = false;
    audio.src = './audio/theme2.mp3';
    audio._audio.onended = () => {
        // When track finishes, alternate between menu themes
        audio._audio.volume = 0;
        if (audio.src.includes('theme1.mp3')) {
            audio.src = './audio/theme2.mp3'
        } else if (audio.src.includes('theme2.mp3')) {
            audio.src = './audio/theme3.mp3'
        } else {
            audio.src = './audio/theme1.mp3'
        }
        audio.play();
    };

    const selectedPacks = $('.pack.selected');
    const toInstall = [];

    selectedPacks.each((index, pack) => {
        const thisPack = $(pack);
        toInstall.push({
            package: thisPack.data('package'),
            name: thisPack.find('.title').text(),
            size: thisPack.data('size').toString() + 'GB'
        })
    });

    $('#progressTotal progress').attr('max', selectedPacks.length);
    let currentPackIndex = 0;
    let currentPackId;

    // Start changing messages every 10 seconds using the currently installing package ID as reference
    const msgChanger = setInterval(() => randomMsg(currentPackId), 10000);

    $('.content').toggleClass('active');

    for (const pack of toInstall) {

        // Reset current pack install message
        $('#progressCurrent .progresstext').text(`Getting ready... (this might take a moment)`);

        // Set current package ID
        currentPackId = pack.package;

        // Force message change for new pack
        randomMsg(pack.package);

        // Update total progress
        $('#progressTotal .progresstext').text(`Installing ${pack.name} (${pack.size})...`);
        $('#progressTotal progress').attr('value', currentPackIndex);
        $('#progressTotal .progressbar span').text(`${currentPackIndex}/${selectedPacks.length}`);
        $('#currentInstallLogo').attr('src', `./logos/${pack.package}.webp`)

        // Create new zip stream object using target package
        const dataDir = process.cwd() + '\\data\\';
        const zip = new StreamZip.async({file: dataDir + pack.package + '.zip'});

        // Initialise current progress for this pack
        const totalFileCount = await zip.entriesCount;
        let doneFileCount = 0;
        $('#progressCurrent progress').attr('value', '0');
        $('#progressCurrent progress').attr('max', totalFileCount);
        $('#progressCurrent .progressbar span').text(`0/${totalFileCount}`);

        // Initialise handler for 'extract' event (fires after each file extract)
        zip.on('extract', (entry, file) => {
            // Update current progress on each file extract
            $('#progressCurrent .progresstext').text(`Extracted "${entry.name}"...`);
            doneFileCount += 1;
            $('#progressCurrent progress').attr('value', doneFileCount);
            $('#progressCurrent .progressbar span').text(`${doneFileCount}/${totalFileCount}`);
        });

        // Start extracting current pack
        await zip.extract(null, dataDir + 'test');

        // Install registry data
        $('#progressCurrent .progresstext').text(`Creating registry entries...`);
        await configureRegistry(pack.package);

        // Increment currentPackIndex and log pack completion
        console.log(`${pack.package} installation finished!`);
        currentPackIndex += 1;
    }

    // Stop message changer and set completion message
    clearInterval(msgChanger);
    $('#currentMessage').text('Installation Complete');

    // Reset current progress values to 0 for 'finished' state
    $('#progressCurrent .progresstext').text(`Extraction Complete`);
    $('#progressCurrent progress').attr('value', '0');
    $('#progressCurrent .progressbar span').text(`0/0`);

    // Set final total progress values for 'finished' state
    $('#progressTotal .progresstext').text(`Installation Finished`);
    $('#progressTotal progress').attr('value', selectedPacks.length);
    $('#progressTotal .progressbar span').text(`${selectedPacks.length}/${selectedPacks.length}`);

    // Reset audio player and re-enable looping
    /* audio.loop = true;
    audio.src = './audio/theme1.mp3';
    audio._audio.removeEventListener('onended', cycleAudioTrack); */

    console.log('All Done!');

}

async function configureRegistry(packId) {
    const regData = registryData[packId];
    if (!regData.keys || !regData.values) return console.error('No registry data to import for pack ' + packId);
    regData.values = JSON.parse(JSON.stringify(regData.values).replaceAll('$INSTALL_DIR$', 'C:\\\\Program Files (x86)\\\\Electronic Arts'));
    await regedit.createKey([...regData.keys], '32').catch(()=>{}); // node-regedit is buggy and always throws an 'unsupported hive' error even on success. So let's catch the error, ignore it and verify manually.
    await regedit.putValue(regData.values, '32').catch(()=>{});

    // Verify that the created keys exist in the registry
    const checkResult = await regedit.list([...regData.keys], '32');
    let foundMissingKey = false;
    Object.keys(checkResult).forEach(key => {
        if (!checkResult[key].exists) foundMissingKey = true;
    });

    if (foundMissingKey) console.error('Failed to create registry data for ' + packId);

    return regData;
}

// Asynchronous sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));