package com.example.PostComposerBackend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestInterceptor implements HandlerInterceptor {

    private static final Logger logger =
            LoggerFactory.getLogger(RequestInterceptor.class);

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {

        String correlationId = MDC.get("X-Correlation-ID");

        logger.info(
                "[CID={}] Before Controller: {} {}",
                correlationId,
                request.getMethod(),
                request.getRequestURI()
        );

        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception) {

        String correlationId = MDC.get("X-Correlation-ID");

        logger.info(
                "[CID={}] After Controller: {} {} | Status: {}",
                correlationId,
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus()
        );
    }
}