/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-handler-names */

import React from 'react';
import { Button, DropdownToggle, Card, CardBody, CardTitle, CardFooter, Page, PageSection, Pagination, Split, SplitItem } from '@patternfly/react-core';
import { TableComposable, TableText, Thead, Tr, Th, Tbody, Td, ActionsColumn } from '@patternfly/react-table';

export class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            perPage: 10,
            totalItemCount: 10
        };
    }

    renderPagination() {
        const { page, perPage, totalItemCount } = this.state;

        const defaultPerPageOptions = [
            {
                title: '1',
                value: 1
            },
            {
                title: '5',
                value: 5
            },
            {
                title: '10',
                value: 10
            }
        ];

        return (
            <Pagination
        itemCount={totalItemCount}
        page={page}
        perPage={perPage}
        perPageOptions={defaultPerPageOptions}
        onSetPage={(_evt, value) => {
            this.fetch(value, perPage);
        }}
        onPerPageSelect={(_evt, value) => {
            this.fetch(1, value);
        }}
        variant="top"
        isCompact
            />
        );
    }

    render() {
        const repositories = [{
            name: 'one',
            branches: 'two',
            prs: 'a',
            workspaces: 'four',
            lastCommit: 'five',
            singleAction: '启动'
        }, {
            name: 'a',
            branches: 'two',
            prs: 'k',
            workspaces: 'four',
            lastCommit: 'five',
            singleAction: '启动'
        }, {
            name: 'p',
            branches: 'two',
            prs: 'b',
            workspaces: 'four',
            lastCommit: 'five',
            singleAction: '启动'
        }, {
            name: '4',
            branches: '2',
            prs: 'b',
            workspaces: 'four',
            lastCommit: 'five',
            singleAction: '启动'
        }, {
            name: '5',
            branches: '2',
            prs: 'b',
            workspaces: 'four',
            lastCommit: 'five',
            singleAction: '启动'
        }];
        const columnNames = {
            name: 'Repositories',
            branches: 'Branches',
            prs: 'Pull requests',
            workspaces: 'Workspaces',
            lastCommit: 'Last commit',
            singleAction: 'Single action'
        };
        const customActionsToggle = props =>
            <DropdownToggle onToggle={props.onToggle} isDisabled={props.isDisabled}>
                操作
            </DropdownToggle>;
        const defaultActions = repo => [{
            title: '停止',
            onClick: () => console.log(`clicked on Some action, on row ${repo.name}`)
        }, {
            title: <a href="https://www.patternfly.org">删除</a>
        }, {
            isSeparator: true
        }, {
            title: '编辑',
            onClick: () => console.log(`clicked on Third action, on row ${repo.name}`)
        }];
        const lastRowActions = repo => [{
            title: '停止',
            onClick: () => console.log(`clicked on Some action, on row ${repo.name}`)
        }, {
            title: <div>删除</div>,
            onClick: () => console.log(`clicked on Another action, on row ${repo.name}`)
        }, {
            isSeparator: true
        }, {
            title: '编辑',
            onClick: () => console.log(`clicked on Third action, on row ${repo.name}`)
        }];

        return (
            <Card>
                <CardTitle>
                    <Split>
                        <SplitItem isFilled>IPTV数据服务</SplitItem>
                        <SplitItem>
                            <Button variant="primary">添  加</Button>
                        </SplitItem>
                    </Split>
                </CardTitle>
                <CardBody>
                    <Page>
                        <PageSection>
                            <TableComposable aria-label="Actions table">
                                <Thead>
                                    <Tr>
                                        <Th>{columnNames.name}</Th>
                                        <Th>{columnNames.branches}</Th>
                                        <Th>{columnNames.prs}</Th>
                                        <Th>{columnNames.workspaces}</Th>
                                        <Th>{columnNames.lastCommit}</Th>
                                        <Td />
                                        <Td />
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {repositories.map(repo => {
                                        let rowActions = defaultActions(repo);
                                        if (repo.name === 'a') {
                                            rowActions = null;
                                        }
                                        if (repo.name === '5') {
                                            rowActions = lastRowActions(repo);
                                        }
                                        let singleActionButton = null;
                                        if (repo.singleAction !== '') {
                                            singleActionButton = (
                                                <TableText>
                                                    <Button variant="secondary">{repo.singleAction}</Button>
                                                </TableText>
                                            );
                                        }
                                        return (
                                            <Tr key={repo.name}>
                                                <Td dataLabel={columnNames.name}>{repo.name}</Td>
                                                <Td dataLabel={columnNames.branches}>{repo.branches}</Td>
                                                <Td dataLabel={columnNames.prs}>{repo.prs}</Td>
                                                <Td dataLabel={columnNames.workspaces}>{repo.workspaces}</Td>
                                                <Td dataLabel={columnNames.lastCommit}>{repo.lastCommit}</Td>
                                                <Td dataLabel={columnNames.singleAction} modifier="fitContent">
                                                    {singleActionButton}
                                                </Td>
                                                <Td isActionCell>
                                                    {rowActions ? <ActionsColumn items={rowActions} isDisabled={repo.name === '4'} actionsToggle={customActionsToggle} /> : null}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </TableComposable>
                        </PageSection>
                    </Page>
                </CardBody>
                <CardFooter>{this.renderPagination()}</CardFooter>
            </Card>

        );
    }
}
