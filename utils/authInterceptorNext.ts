export interface AuthInterceptor {
    url:string,
    action:'quiz-submit'
}

export const authInterceptorNext = (interceptor:AuthInterceptor)=>interceptor