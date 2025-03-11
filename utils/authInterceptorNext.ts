export interface authInterceptor {
    url:string,
    action:'quiz-submit'
}

export const authInterceptorNext = (interceptor:authInterceptor)=>interceptor