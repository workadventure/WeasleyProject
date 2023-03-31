/// <reference types="@workadventure/iframe-api-typings" />

WA.onInit().then(() => {
   const soundsPath = '../public/sounds/'

    const soundConfig = {
        volume: 1,
        loop: false,
        rate: 1,
        detune: 1,
        delay: 0,
        seek: 0,
        mute: false
    }

    const doSound = WA.sound.loadSound(`${soundsPath}do.wav`);
    const reSound = WA.sound.loadSound(`${soundsPath}re.wav`);
    const miSound = WA.sound.loadSound(`${soundsPath}mi.wav`);
    const faSound = WA.sound.loadSound(`${soundsPath}fa.wav`);
    const solSound = WA.sound.loadSound(`${soundsPath}sol.wav`);
    const laSound = WA.sound.loadSound(`${soundsPath}la.wav`);
    const siSound = WA.sound.loadSound(`${soundsPath}si.wav`);


    WA.room.onEnterLayer('notes/do').subscribe(()=> {
        doSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/re').subscribe(()=> {
        reSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/mi').subscribe(()=> {
        miSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/fa').subscribe(()=> {
        faSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/sol').subscribe(()=> {
        solSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/la').subscribe(()=> {
        laSound.play(soundConfig);
    })
    WA.room.onEnterLayer('notes/si').subscribe(()=> {
        siSound.play(soundConfig);
    })

})

export {};