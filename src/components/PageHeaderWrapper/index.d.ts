import React from 'react';

export interface ResultProps {
    actions?: React.ReactNode;
    className?: string;
    description?: React.ReactNode;
    extra?: React.ReactNode;
    style?: React.CSSProperties;
    title?: React.ReactNode;
    type: 'success' | 'error';
}

// eslint-disable-next-line react/prefer-stateless-function
export default class Result extends React.Component<ResultProps, any> {}
