import React,{useState} from 'react'
import {render,screen,fireEvent} from '@testing-library/react'
import {it,expect,vi} from 'vitest'
import {Settings} from '../../components/Settings'
import type {AppSettings} from '../../types'
vi.mock('../../components/BreathingOrb',()=>({default:()=>null}))
vi.mock('../../services/buttonSoundService',()=>({buttonSoundService:{play:vi.fn()}}))
it('keeps Core Audio slider and percentage responsive to changes',()=>{
 const change=vi.fn()
 const initial={theme:'dark',soundEffectsOn:true,musicOn:true,soundscapeId:'default',iAmSoundscapeId:'',iLoveSoundscapeId:'',meditationSoundscapeId:'',ambienceVolume:50,voiceId:'',reminders:{enabled:false,timezone:'America/New_York',snoozeMinutes:15,notificationPermission:'default',practiceTimes:{}}} as AppSettings
 function Harness(){const [settings,set]=useState(initial);return <Settings settings={settings} onChangeSettings={next=>{change(next);set(next)}} onChangeFocus={vi.fn()} onBack={vi.fn()} onSignOut={vi.fn()} onReplayTutorial={vi.fn()} onReplayWelcomeInvocation={vi.fn()} onAudioUpload={vi.fn()} theme="dark" userAudioFile={null} availableSoundscapes={[]}/>}
 render(<Harness/>);
 fireEvent.change(screen.getByRole('slider',{name:'Core audio volume'}),{target:{value:'20'}})
 expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ambienceVolume:20}))
 expect(screen.getByRole('slider',{name:'Core audio volume'})).toHaveValue('20')
 expect(screen.getByText('20%')).toBeInTheDocument()
})
