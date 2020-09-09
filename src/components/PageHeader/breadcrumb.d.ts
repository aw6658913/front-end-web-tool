import React from 'react';
import { PageHeaderProps } from './index.d';

// eslint-disable-next-line react/prefer-stateless-function
export default class BreadcrumbView extends React.Component<PageHeaderProps, any> {}

export function getBreadcrumb(breadcrumbNameMap: object, url: string): object;
