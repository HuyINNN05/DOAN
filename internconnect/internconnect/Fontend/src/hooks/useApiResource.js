import { useCallback, useEffect, useRef, useState } from 'react'
export default function useApiResource(loader, initial = [], {refreshOnFocus=false} = {}) {
  const [data,setData] = useState(initial), [loading,setLoading] = useState(true), [error,setError] = useState(''), [errorCode,setErrorCode] = useState('')
  const sequence = useRef(0)
  const invalidate = useCallback(() => { sequence.current += 1 }, [])
  const reload = useCallback(async () => {
    const request = ++sequence.current
    setLoading(true); setError(''); setErrorCode('')
    try { const result = await loader(); if (request === sequence.current) setData(result) }
    catch (e) { if (request === sequence.current) { setError(e.response?.data?.error?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'); setErrorCode(e.response?.data?.error?.code || '') } }
    finally { if (request === sequence.current) setLoading(false) }
  }, [loader])
  useEffect(() => { const timer = setTimeout(reload,0); return () => { clearTimeout(timer); invalidate() } }, [reload,invalidate])
  useEffect(()=>{
    if(!refreshOnFocus)return
    let timer
    const refreshVisible=()=>{if(document.visibilityState==='visible'){clearTimeout(timer);timer=setTimeout(reload,50)}}
    window.addEventListener('focus',refreshVisible)
    document.addEventListener('visibilitychange',refreshVisible)
    return ()=>{clearTimeout(timer);window.removeEventListener('focus',refreshVisible);document.removeEventListener('visibilitychange',refreshVisible)}
  },[reload,refreshOnFocus])
  return { data,setData,loading,error,errorCode,reload }
}
