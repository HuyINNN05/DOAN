import test from 'node:test'
import assert from 'node:assert/strict'
import { AxiosError } from 'axios'
import { Buffer } from 'node:buffer'
import { api, setAccessToken } from '../Fontend/src/api/client.js'

const unauthorized = (config) => Promise.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401, data: {} }))

test('incorrect login preserves the credentials error without refreshing', async () => {
  const adapter = api.defaults.adapter
  const calls = []
  api.defaults.adapter = (config) => { calls.push(config.url); return unauthorized(config) }
  try {
    await assert.rejects(api.post('/auth/login', { email: 'wrong@example.com', password: 'wrong' }), (error) => error.config.url === '/auth/login')
    assert.deepEqual(calls, ['/auth/login'])
  } finally { api.defaults.adapter = adapter }
})

test('expired session clears the old access token when refresh fails', async () => {
  const adapter = api.defaults.adapter
  const calls = []
  setAccessToken('expired')
  api.defaults.adapter = (config) => {
    calls.push(config)
    return config.url === '/public/companies'
      ? Promise.resolve({ status: 200, data: [], headers: {}, config })
      : unauthorized(config)
  }
  try {
    await assert.rejects(api.get('/auth/me'))
    await api.get('/public/companies')
    assert.deepEqual(calls.map((config) => config.url), ['/auth/me', '/auth/refresh', '/public/companies'])
    assert.equal(calls[2].headers.Authorization, undefined)
  } finally { api.defaults.adapter = adapter; setAccessToken(null) }
})

test('requests and refresh carry the tab identity and expected account',async()=>{
  const adapter=api.defaults.adapter,previous=globalThis.sessionStorage
  const values=new Map([['internconnect_session',JSON.stringify({id:2,role:'student'})]])
  globalThis.sessionStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}
  const calls=[]
  setAccessToken('expired')
  api.defaults.adapter=config=>{
    calls.push(config)
    if(config.url==='/auth/refresh')return Promise.resolve({status:200,data:{data:{accessToken:'renewed',user:{id:2,role:'student'}}},headers:{},config})
    if(!config._retried)return unauthorized(config)
    return Promise.resolve({status:200,data:{},headers:{},config})
  }
  try{
    await api.get('/students/me/applications')
    assert.equal(calls.length,3)
    assert.ok(calls[0].headers['X-Session-Id'])
    for(const call of calls){assert.equal(call.headers['X-Session-Id'],calls[0].headers['X-Session-Id']);assert.equal(call.headers['X-Expected-User'],'2')}
    assert.equal(calls[2].headers.Authorization,'Bearer renewed')
  }finally{api.defaults.adapter=adapter;setAccessToken(null);if(previous===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=previous}
})

function storageFixture() {
  const previous=globalThis.sessionStorage,values=new Map([['internconnect_session',JSON.stringify({id:2,role:'student'})]])
  globalThis.sessionStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}
  return {values,restore:()=>{if(previous===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=previous}}
}
const success=(config,data={})=>Promise.resolve({status:200,data,headers:{},config})
test('student interviews refresh before sending protected requests after reload',async()=>{
  const adapter=api.defaults.adapter,storage=storageFixture(),calls=[]
  setAccessToken(null)
  api.defaults.adapter=config=>{
    calls.push({url:config.url,authorization:config.headers.Authorization})
    return success(config,config.url==='/auth/refresh'?{data:{accessToken:'restored-student',user:{id:2,role:'student'}}}:{data:[]})
  }
  try{
    await Promise.all([api.get('/students/me/interviews'),api.get('/students/me/applications')])
    assert.equal(calls[0].url,'/auth/refresh')
    assert.equal(calls.filter(call=>call.url==='/auth/refresh').length,1)
    assert.ok(calls.slice(1).every(call=>call.authorization==='Bearer restored-student'))
    assert.equal(storage.values.get('internconnect_access_token'),'restored-student')
  }finally{api.defaults.adapter=adapter;setAccessToken(null);storage.restore()}
})
test('tab-stored token survives reload and expired tokens refresh proactively',async()=>{
  const adapter=api.defaults.adapter,storage=storageFixture(),calls=[]
  setAccessToken(null)
  storage.values.set('internconnect_access_token','persisted-student')
  api.defaults.adapter=config=>{calls.push({url:config.url,authorization:config.headers.Authorization});return success(config,config.url==='/auth/refresh'?{data:{accessToken:'new-student',user:{id:2,role:'student'}}}:{data:[]})}
  try{
    await api.get('/students/me/interviews')
    assert.equal(calls[0].authorization,'Bearer persisted-student')
    assert.equal(calls.length,1)
    setAccessToken(`header.${Buffer.from(JSON.stringify({exp:1})).toString('base64url')}.signature`)
    await api.get('/students/me/interviews')
    assert.deepEqual(calls.map(call=>call.url),['/students/me/interviews','/auth/refresh','/students/me/interviews'])
    assert.equal(calls[2].authorization,'Bearer new-student')
  }finally{api.defaults.adapter=adapter;setAccessToken(null);storage.restore()}
})
test('late 401 from an old request retries with the refreshed token without rotating again',async()=>{
  const adapter=api.defaults.adapter,storage=storageFixture(),calls=[]
  let release
  const ready=new Promise(resolve=>{release=resolve})
  setAccessToken('old-student')
  api.defaults.adapter=async config=>{
    calls.push(config.url)
    if(config.url==='/auth/refresh')return success(config,{data:{accessToken:'new-student',user:{id:2,role:'student'}}})
    if(config._retried){assert.equal(config.headers.Authorization,'Bearer new-student');if(config.url==='/students/me/applications')release();return success(config,{data:[]})}
    if(config.url==='/students/me/interviews')await ready
    return unauthorized(config)
  }
  try{
    await Promise.all([api.get('/students/me/applications'),api.get('/students/me/interviews')])
    assert.equal(calls.filter(url=>url==='/auth/refresh').length,1)
  }finally{api.defaults.adapter=adapter;setAccessToken(null);storage.restore()}
})
