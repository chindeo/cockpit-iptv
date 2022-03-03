/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/jsx-handler-names */
// /*
//  * This file is part of Cockpit.
//  *
//  * Copyright (C) 2017 Red Hat, Inc.
//  *
//  * Cockpit is free software; you can redistribute it and/or modify it
//  * under the terms of the GNU Lesser General Public License as published by
//  * the Free Software Foundation; either version 2.1 of the License, or
//  * (at your option) any later version.
//  *
//  * Cockpit is distributed in the hope that it will be useful, but
//  * WITHOUT ANY WARRANTY; without even the implied warranty of
//  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//  * Lesser General Public License for more details.
//  *
//  * You should have received a copy of the GNU Lesser General Public License
//  * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
//  */

// import cockpit from "cockpit";
// import React from "react";
// import { Bullseye } from "@patternfly/react-core";

// import { Table, TableHeader, TableBody } from '@patternfly/react-table';

// const _ = cockpit.gettext;

// export class Application extends React.Component {
//     constructor() {
//         super();
//         this.state = { hostname: _("Unknown") };

//         cockpit.file("/etc/hostname").watch((content) => {
//             this.setState({ hostname: content.trim() });
//         });
//         this.state = {
//             columns: [
//                 { title: 'Repositories', props: null },
//                 'Branches',
//                 { title: 'Pull requests', props: null },
//                 'Workspaces',
//                 'Last Commit'
//             ],
//             rows: [['one', 'two', 'three', 'four', 'five']]
//         };
//     }

//     render() {
//         const { columns, rows } = this.state;
//         return (
//             <Bullseye>
//                 <div>
//                     <Table caption="IPTV数据服务" rows={rows} cells={columns}>
//                         <TableHeader />
//                         <TableBody />
//                     </Table>
//                 </div>
//             </Bullseye>
//         );
//     }
// }

import cockpit from "cockpit";
import React from 'react';
import {
    Bullseye,
    Card,
    Gallery,
    Page,
    PageSection,
    SkipToContent,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

const _ = cockpit.gettext;

export class Application extends React.Component {
    constructor() {
        super();
        this.state = { hostname: _("Unknown") };

        cockpit.file("/etc/hostname").watch((content) => {
            this.setState({ hostname: content.trim() });
        });
        this.state = {
            columns: [
                { title: 'Repositories', props: null },
                'Branches',
                { title: 'Pull requests', props: null },
                'Workspaces',
                'Last Commit'
            ],
            rows: [['one', 'two', 'three', 'four', 'five']]
        };
    }

    render() {
        const { columns, rows } = this.state;

        const pageId = 'main-content-card-view-default-nav';
        const PageSkipToContent = <SkipToContent href={`#${pageId}`}>Skip to Content</SkipToContent>;

        return (
            <>
                <Page
          skipToContent={PageSkipToContent}
          mainContainerId={pageId}
                >
                    <PageSection isFilled>
                        <Gallery hasGutter>
                            <Card isHoverable isCompact>
                                <Bullseye>
                                    <div>
                                        <Table caption="IPTV数据服务" rows={rows} cells={columns}>
                                            <TableHeader />
                                            <TableBody />
                                        </Table>
                                    </div>
                                </Bullseye>
                            </Card>
                        </Gallery>
                    </PageSection>
                </Page>
            </>
        );
    }
}
