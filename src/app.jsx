/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-handler-names */

import cockpit from "cockpit";
import React, { useState } from 'react';
import { Button, DropdownToggle, Card, CardBody, CardTitle, CardFooter, Page, PageSection, Pagination, Split, SplitItem, Label, Alert, AlertGroup, AlertActionLink } from '@patternfly/react-core';
import { TableComposable, TableText, Thead, Tr, Th, Tbody, Td, ActionsColumn } from '@patternfly/react-table';
import { format } from 'date-fns';
import { ActivateZoneModal } from './add.jsx';

const http = cockpit.http({
    address: "localhost",
    port: 10008,
    // headers: {
    //     Authorization: "Basic dXNlcjpwYXNzd29yZA=="
    // },
    // tls: {}
});

export class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: [],
            repositories: [],

            page: 1,
            perPage: 10,
            totalItemCount: 10
        };
        this.onSetPage = this.onSetPage.bind(this);
        this.onPerPageSelect = this.onPerPageSelect.bind(this);
        this.tasklist = this.tasklist.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
        this.addAlert = this.addAlert.bind(this);
    }

    onSetPage (_event, pageNumber) {
        this.setState({
            page: pageNumber
        });
        this.tasklist();
    }

    onPerPageSelect (_event, perPageNumber) {
        this.setState({
            perPage:perPageNumber
        });
        this.tasklist();
    }

    addAlert(type, text, detail) {
        const timeout = 1500;
        const inAlert = (
            <Alert
variant={type}
key={1}
title={text}
 timeout={timeout}
            >
                {detail && (<p>{detail}</p>)}
            </Alert>
        );
        this.state.alerts.push(inAlert);
    }

    stopTask(id) {
        const request = http.get("/api/v1/stream/stop/" + id);
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist();
                request.then(data => {
                    this.addAlert("success", "操作成功");
                });
            } else {
                request.then(data => {
                    this.addAlert("danger", "操作失败", data);
                });
            }
        });
    }

    startTask(id) {
        const request = http.get("/api/v1/stream/start/" + id);
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist();
                request.then(data => {
                    this.addAlert("success", "操作成功");
                });
            } else {
                request.then(data => {
                    this.addAlert("danger", "操作失败", data);
                });
            }
        });
    }

    delTask(id) {
        const request = http.get("/api/v1/stream/del/" + id);
        request.response((status, headers) => {
            if (status === 200) {
                this.tasklist();
                request.then(data => {
                    this.addAlert("success", "操作成功");
                });
            } else {
                request.then(data => {
                    this.addAlert("danger", "操作失败", data);
                });
            }
        });
    }

    tasklist() {
        const request = http.get("/api/v1/pushers", { start:this.state.page, limit:this.state.perPage });
        request.response((status, headers) => {
            if (status === 200) {
                request.then(data => {
                    // 需要转换json to obj
                    if (data !== "" && data !== null) {
                        const res = JSON.parse(data);
                        this.setState({
                            repositories: res.rows,
                            totalItemCount: res.total
                        });
                    }
                }).catch((exception) => {
                    console.log(exception);
                });
            }
        });
    }

    componentDidMount() {
        this.tasklist();
    }

    renderPagination() {
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
        itemCount={this.state.totalItemCount}
        page={this.state.page}
        perPage={this.state.perPage}
        perPageOptions={defaultPerPageOptions}
        onSetPage={this.onSetPage}
        onPerPageSelect={this.onPerPageSelect}
        variant="top"
        isCompact
            />
        );
    }

    render() {
        const columnNames = {
            id: 'ID',
            roomName: '名称',
            source: '数据源',
            startAt: '启动时间',
            status: '任务状态',
            transType: '输出类型',
            url: '输出地址'
        };

        const customActionsToggle = props =>
            <DropdownToggle onToggle={props.onToggle} isDisabled={props.isDisabled}>
                操作
            </DropdownToggle>;

        const defaultActions = repo => [{
            title: "删除",
            onClick: this.delTask(this, repo.id)
        }, {
            isSeparator: true
        }, {
            title: '编辑',
            onClick: () => console.log(`clicked on Third action, on row ${repo.name}`)
        }];

        return (
            <>
                <AlertGroup isLiveRegion>
                    {this.state.alerts}
                </AlertGroup>
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
                                            <Th width={2}>{columnNames.id}</Th>
                                            <Th width={5}>{columnNames.roomName}</Th>
                                            <Th width={20}>{columnNames.source}</Th>
                                            <Th width={15}>{columnNames.url}</Th>
                                            <Th>{columnNames.transType}</Th>
                                            <Th>{columnNames.status}</Th>
                                            <Th>{columnNames.startAt}</Th>
                                            <Td />
                                            <Td />
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {this.state.repositories.map(repo => {
                                            const rowActions = defaultActions(repo);
                                            return (
                                                <Tr key={repo.roomName}>
                                                    <Td dataLabel={columnNames.id}>{repo.id}</Td>
                                                    <Td dataLabel={columnNames.roomName}>{repo.roomName}</Td>
                                                    <Td dataLabel={columnNames.source} modifier="breakWord"><a>{repo.source}</a></Td>
                                                    <Td dataLabel={columnNames.url} modifier="breakWord"><a>{repo.url}</a></Td>
                                                    <Td dataLabel={columnNames.transType}>{repo.transType}</Td>
                                                    <Td dataLabel={columnNames.status}>
                                                        <Label color={repo.status === "已启动" ? "green" : ""}>{repo.status}</Label>
                                                    </Td>
                                                    <Td dataLabel={columnNames.startAt} modifier="breakWord">{ repo.startAt !== "-" ? format(new Date(repo.startAt), "yyyy-MM-dd H:m:s") : repo.startAt }</Td>
                                                    <Td dataLabel={columnNames.singleAction} modifier="fitContent">
                                                        <TableText>
                                                            {repo.status === '已启动' ? <Button variant="danger" onClick={this.stopTask.bind(this, repo.id)}>停止</Button> : <Button variant="primary" onClick={this.startTask.bind(this, repo.id)}>启动</Button>}
                                                        </TableText>
                                                    </Td>
                                                    <Td isActionCell>
                                                        {rowActions ? <ActionsColumn items={rowActions} isDisabled={repo.status === '已启动'} actionsToggle={customActionsToggle} /> : null}
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
                    { this.state.showActivateZoneModal && <ActivateZoneModal close={this.close} /> }
                </Card>
            </>
        );
    }
}
