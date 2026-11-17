import React from 'react'
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react'
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest'
import {PrayerSession} from '../../components/PrayerSession'
import {api} from '../../services/api'
vi.mock('../../services/buttonSoundService',()=>({buttonSoundService:{play:vi.fn()}}))
vi.mock('../../services/api',()=>({api:{getPrayerContent:vi.fn().mockResolvedValue({sessionPrayers:['Curated prayer'],guideSteps:[]}),getUserPrayers:vi.fn().mockResolvedValue([]),addUserPrayer:vi.fn(),removeUserPrayer:vi.fn()}}))
const props={prayerPathId:'universal' as const,prayerProfile:{intent:'gratitude' as const,tone:'gentle' as const,language:'english' as const,style:'standard' as const},onBack:vi.fn(),onComplete:vi.fn(),onChangePath:vi.fn(),theme:'dark' as const}
beforeEach(()=>{
 vi.clearAllMocks()
 const items=new Map<string,string>()
 vi.stubGlobal('localStorage',{getItem:(key:string)=>items.get(key)??null,setItem:(key:string,value:string)=>items.set(key,value),removeItem:(key:string)=>items.delete(key),clear:()=>items.clear()})
})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
describe('private prayer drafts',()=>{
 it('never loads unowned legacy or another account drafts',async()=>{
  const draft={id:'local-1',body:'Private account A prayer',path_key:'universal',title:''}
  localStorage.setItem('abundance_local_user_prayers',JSON.stringify({universal:[draft]}))
  localStorage.setItem('abundance_local_user_prayers:A',JSON.stringify({universal:[draft]}))
  const view=render(<PrayerSession {...props} accountId="B"/>)
  await screen.findByText('Curated prayer')
  expect(screen.queryByText('Private account A prayer')).not.toBeInTheDocument()
  view.rerender(<PrayerSession {...props} accountId="A"/>)
  await waitFor(()=>expect(screen.getAllByText('Private account A prayer').length).toBeGreaterThan(0))
 })
 it('stores failed saves only in the current account draft key',async()=>{
  vi.mocked(api.addUserPrayer).mockRejectedValue(new Error('Offline'))
  render(<PrayerSession {...props} accountId="A"/>)
  await screen.findByText('Curated prayer')
  fireEvent.change(screen.getByPlaceholderText('Write your personal prayer here.'),{target:{value:'An offline private prayer'}})
  fireEvent.click(screen.getByRole('button',{name:/save.*prayer/i}))
  await waitFor(()=>expect(localStorage.getItem('abundance_local_user_prayers:A')).toContain('An offline private prayer'))
  expect(localStorage.getItem('abundance_local_user_prayers:B')).toBeNull()
  expect(localStorage.getItem('abundance_local_user_prayers')).toBeNull()
 })
 it('does not create an offline duplicate after server success and refresh failure',async()=>{
  vi.mocked(api.addUserPrayer).mockResolvedValue({success:true,id:'1'} as any)
  render(<PrayerSession {...props} accountId="A"/>)
  await screen.findByText('Curated prayer')
  vi.mocked(api.getUserPrayers).mockRejectedValueOnce(new Error('Refresh offline'))
  fireEvent.change(screen.getByPlaceholderText('Write your personal prayer here.'),{target:{value:'Saved once'}})
  fireEvent.click(screen.getByRole('button',{name:/save.*prayer/i}))
  expect(await screen.findByText(/Prayer saved to your account/)).toBeInTheDocument()
  expect(localStorage.getItem('abundance_local_user_prayers:A')).toBeNull()
 })
})
