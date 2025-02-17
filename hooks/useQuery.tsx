import api from '@/utils/api';
import { useCallback, useEffect, useState } from 'react';


export default function useQuery<T>(url:string) {

    const [data, setData] = useState<T>();

    const fetchData = useCallback(
      async () => {
        const res = await api.get<T>(url);
      setData((res).data)
      },
      [url],
    )
    
    useEffect(() => {
      fetchData()
      
    }, [fetchData])
    
  return data
}