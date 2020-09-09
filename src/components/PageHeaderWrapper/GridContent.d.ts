import React from 'react';

export interface GridContentProps {
    contentWidth: string;
    children: React.ReactNode;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class GridContent extends React.Component<GridContentProps, any> {}
