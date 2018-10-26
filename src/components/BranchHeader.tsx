import * as React from 'react';

import { Git } from '../git';

import { CommitBox } from './CommitBox';

import { NewBranchBox } from './NewBranchBox';

import {
  branchStyle,
  branchLabelStyle,
  branchDropdownButtonStyle,
  newBranchButtonStyle,
  headerButtonDisabledStyle,
  branchListItemStyle,
  stagedCommitButtonStyle,
  stagedCommitButtonReadyStyle,
  stagedCommitButtonDisabledStyle,
  smallBranchStyle,
  expandedBranchStyle,
  openHistorySideBarButtonStyle,
  openHistorySideBarIconStyle,
  branchHeaderCenterContent
} from '../componentsStyle/BranchHeaderStyle';

import { classes } from 'typestyle';

export interface IBranchHeaderState {
  dropdownOpen: boolean;
  showCommitBox: boolean;
  showNewBranchBox: boolean;
}

export interface IBranchHeaderProps {
  currentFileBrowserPath: string;
  topRepoPath: string;
  currentBranch: string;
  stagedFiles: any;
  data: any;
  refresh: any;
  disabled: boolean;
  toggleSidebar: Function;
  showList: boolean;
  currentTheme: string;
}

export class BranchHeader extends React.Component<
  IBranchHeaderProps,
  IBranchHeaderState
  > {
  interval: any;
  constructor(props: IBranchHeaderProps) {
    super(props);
    this.state = {
      dropdownOpen: false,
      showCommitBox: true,
      showNewBranchBox: false
    };
  }

  /** Commit all staged files */
  commitAllStagedFiles = (message: string, path: string): void => {
    if (message && message !== '') {
      let gitApi = new Git();
      gitApi.commit(message, path).then(response => {
        this.props.refresh();
      })
        .then(resp => gitApi.push(path));
    }
  };

  /** Update state of commit message input box */
  updateCommitBoxState(disable: boolean, numberOfFiles: number) {
    if (disable) {
      if (numberOfFiles === 0) {
        return classes(
          stagedCommitButtonStyle,
          stagedCommitButtonDisabledStyle
        );
      } else {
        return classes(stagedCommitButtonStyle, stagedCommitButtonReadyStyle);
      }
    } else {
      return stagedCommitButtonStyle;
    }
  }

  /** Switch current working branch */
  async switchBranch(branchName: string) {
    let gitApi = new Git();
    await gitApi.checkout(
      true,
      false,
      branchName,
      false,
      null,
      this.props.currentFileBrowserPath
    );
    this.toggleSelect();
    this.props.refresh();
  }

  createNewBranch = async (branchName: string) => {
    let gitApi = new Git();
    await gitApi.checkout(
      true,
      true,
      branchName,
      false,
      null,
      this.props.currentFileBrowserPath
    );
    this.toggleNewBranchBox();
    this.props.refresh();
  };
/*
  createPullRequest = async () => {
    let gitApi = new Git();
    await gitApi.pullRequest(
      this.props.currentFileBrowserPath
    );
    this.props.refresh();
    alert('Created Pull request for User repo');
  };  
*/

  pull = async () => {
    let gitApi = new Git();
    await gitApi.pull(
      this.props.currentFileBrowserPath
    );
    this.props.refresh();
    alert('Pulled From remote repository');
  };

  createPullRequestToMasterRepo = async () => {
    let gitAPI = new Git();
    await gitAPI.pullRequestToMaster(
      this.props.currentFileBrowserPath
    );
    this.props.refresh();
    alert('Created Pull request for Master Repo')
  };


  toggleSelect() {
    this.props.refresh();
    if (!this.props.disabled) {
      this.setState({
        showCommitBox: !this.state.showCommitBox,
        dropdownOpen: !this.state.dropdownOpen
      });
    }
  }

  getBranchStyle() {
    if (this.state.dropdownOpen) {
      return classes(branchStyle, expandedBranchStyle);
    } else {
      return this.props.showList
        ? branchStyle
        : classes(branchStyle, smallBranchStyle);
    }
  }

  toggleNewBranchBox = (): void => {
    this.props.refresh();
    if (!this.props.disabled) {
      this.setState({
        showNewBranchBox: !this.state.showNewBranchBox,
        dropdownOpen: false
      });
    }
  };

  render() {
    return (
      <div className={this.getBranchStyle()}>
        <button
          className={openHistorySideBarButtonStyle}
          onClick={() => this.props.toggleSidebar()}
          title={'Show commit history'}
        >
          History
          <span className={openHistorySideBarIconStyle} />
        </button>
  {/*      <button
          onClick={() => this.createPullRequest()}
          title={'Create Pull Request to User Repo'}
        >
          Pull Request to User Repo
  </button> */}
        <button
          onClick={() => this.createPullRequestToMasterRepo()}
          title={'Create Pull Request to Master Repo'}
        >
          Pull Request to Master Repo
        </button>
        <button
          onClick={() => this.pull()}
          title={'Pull'}
        >
          Pull
        </button>
        <div className={branchHeaderCenterContent}>
          <h3 className={branchLabelStyle}>{this.props.currentBranch}</h3>
          <div
            className={
              this.props.disabled
                ? classes(
                  branchDropdownButtonStyle(this.props.currentTheme),
                  headerButtonDisabledStyle
                )
                : branchDropdownButtonStyle(this.props.currentTheme)
            }
            title={'Change the current branch'}
            onClick={() => this.toggleSelect()}
          />
          {!this.state.showNewBranchBox && (
            <div
              className={
                this.props.disabled
                  ? classes(
                    newBranchButtonStyle(this.props.currentTheme),
                    headerButtonDisabledStyle
                  )
                  : newBranchButtonStyle(this.props.currentTheme)
              }
              title={'Create a new branch'}
              onClick={() => this.toggleNewBranchBox()}
            />
          )}
          {this.state.showNewBranchBox &&
            this.props.showList && (
              <NewBranchBox
                createNewBranch={this.createNewBranch}
                toggleNewBranchBox={this.toggleNewBranchBox}
              />
            )}
        </div>
        {this.state.dropdownOpen && (
          <div>
            {this.props.data.map((branch: any, branchIndex: number) => {
              return (
                <li
                  className={branchListItemStyle}
                  key={branchIndex}
                  onClick={() => this.switchBranch(branch.name)}
                >
                  {branch.name}
                </li>
              );
            })}
          </div>
        )}
        {this.state.showNewBranchBox && (
          <div>Branching from {this.props.currentBranch}</div>
        )}
        {this.state.showCommitBox &&
          this.props.showList && (
            <CommitBox
              checkReadyForSubmit={this.updateCommitBoxState}
              stagedFiles={this.props.stagedFiles}
              commitAllStagedFiles={this.commitAllStagedFiles}
              topRepoPath={this.props.topRepoPath}
              refresh={this.props.refresh}
            />
          )}
      </div>
    );
  }
}
