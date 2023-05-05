import {MessageBarType} from '@fluentui/react';
import {
	type IReactionDisposer, makeAutoObservable, reaction, runInAction, observable,
} from 'mobx';
import React, {
	createContext, FC, useCallback, useContext, useMemo, PropsWithChildren,
} from 'react';
import {emitEvent} from '../utils/eventEmit';
import {defaultThemes, themeConfigList} from '../utils/loadVegaResource';
import {
	requestV1, AccessTokenStorageKey, RefreshTokenStorageKey, getServerUrl,
} from '../utils/request';
import {requestAnotherWindow} from '../utils/requestAnotherWindow';

export interface IUserInfo {
	userName: string;
	email: string;
	eduEmail: string;
	phone: string;
	isDefaultAvatar: boolean;
	avatarURL: string;
	createdAt: number;
}

export const KanariesPath = (
	new URL(window.location.toString()).searchParams.get('kanaries_path')
) || `${window.location.protocol}//kanaries.${window.location.hostname.endsWith('.cn') ? 'cn' : 'net'}`;

export interface ITheme {
	name: string;
	config: string;
	previewSrc: string;
	isDefault: boolean;
	id: string;
}

export interface IThemeOnCloud {
	id: string;
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	config: Record<string, any>;
	cover: {
		uploadUrl: string;
		storageId: string;
		downloadUrl: string;
	};
	isFavorite: boolean;
	favoritesTotal: boolean;
	owner: string;
}

export default class UserStore {
	public loginStatus: 'pending' | 'loggedIn' | 'loggedOut';

	public user: (IUserInfo & { workspaceName: string }) | null;

	public themes: readonly ITheme[] = [];

	// eslint-disable-next-line class-methods-use-this
	public get defaultThemes() {
		return defaultThemes;
	}

	public get allThemes() {
		return [...this.themes, ...this.defaultThemes];
	}

	public themeId = Object.keys(themeConfigList)[0];

	public get curTheme() {
		return this.allThemes.find(thm => thm.id === this.themeId) ?? null;
	}

	protected readonly disposers: IReactionDisposer[];

	constructor() {
		this.user = null;
		this.loginStatus = 'loggedOut';
		makeAutoObservable(this, {
			user: observable.ref,
			themes: observable.ref,
			// @ts-expect-error non-public fields
			disposers: false,
		});
		this.disposers = [
			reaction(() => this.loginStatus, status => {
				if (status === 'loggedIn') {
					this.updateUserInfo();
				}
			}),
			reaction(() => this.user, user => {
				if (user) {
					this.updateThemes(user.workspaceName);
				}
			}),
		];
		this.updateAuthStatus();
	}

	// eslint-disable-next-line max-len
	protected async customAvatar(value: { file?: File; isDefaultAvatar?: boolean; defaultAvatarUrl?: string }) {
		const {file, isDefaultAvatar} = value;
		const data = new FormData();
		if (file) {
			data.append('file', file);
		}
		const url = getServerUrl('/api/ce/avatar');
		const requestObj: RequestInit = {
			method: 'POST',
			credentials: 'include',
			body: file ? data : JSON.stringify(value),
		};
		if (isDefaultAvatar) {
			requestObj.headers = {
				'Content-Type': 'application/json',
			};
		}
		const res = await fetch(url, requestObj);
		const result = await res.json();
		if (result.success && this.user) {
			this.user.avatarURL = result.data.avatarURL;
		}
		return result.success;
	}

	public setTheme(themeId: string) {
		if (this.allThemes.find(thm => thm.id === themeId)) {
			this.themeId = themeId;
		}
	}

	protected async updateUserInfo() {
		try {
			if (this.loginStatus !== 'loggedIn') {
				return;
			}
			const url = getServerUrl('/api/ce/personal');
			const result = requestV1.unwrap(await requestV1.get<void, IUserInfo>(url));
			if (result !== null) {
				const wspUrl = getServerUrl('/api/ce/simpleInfo/workspace');
				// eslint-disable-next-line max-len
				const wsp = requestV1.unwrap(await requestV1.get<{userName: string}, {name: string}>(wspUrl, {userName: result.userName}));
				runInAction(() => {
					this.user = {
						...result,
						workspaceName: wsp.name,
					};
					if (!result.avatarURL) {
						this.customAvatar({
							isDefaultAvatar: true,
							defaultAvatarUrl: 'https://foghorn-assets.s3.ap-northeast-1.amazonaws.com/avatar/small/avatar-B-01.png',
						});
					}
				});
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}

	public async updateThemes(workspaceName: string) {
		try {
			runInAction(() => {
				this.themes = [];
			});
			if (this.loginStatus !== 'loggedIn') {
				return;
			}
			const url = getServerUrl('/api/ce/theme/list');
			// eslint-disable-next-line no-spaced-func, func-call-spacing
			const result = requestV1.unwrap(
				await requestV1.get<{ workspaceName: string }, { list: IThemeOnCloud[] }>(url, {
					workspaceName,
				}),
			);
			if (result !== null) {
				runInAction(() => {
					this.themes = result.list.map(thm => {
						const res = {
							...thm,
							isDefault: false,
							config: '{}',
							previewSrc: thm.cover.downloadUrl,
						};
						res.config = JSON.stringify(thm.config, null, 2);
						return res;
					});
				});
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}

	public async updateAuthStatus() {
		runInAction(() => {
			this.loginStatus = 'pending';
		});
		try {
			const url = getServerUrl('/api/auth/v1/loginStatus');
			const res = requestV1.unwrap(
				await requestV1.get<void, { loginStatus: boolean; userName: string }>(url),
			);
			runInAction(() => {
				this.loginStatus = res.loginStatus ? 'loggedIn' : 'loggedOut';
			});
			return res.loginStatus;
		} catch (error) {
			runInAction(() => {
				this.loginStatus = 'loggedOut';
			});
			return false;
		}
	}

	public async signUp(): Promise<void> {
		runInAction(() => {
			this.loginStatus = 'pending';
		});
		try {
			await requestAnotherWindow(`${KanariesPath}/home/access?agentType=asp&clientId=${encodeURIComponent(import.meta.env.VITE_APP_ID)
			}&clientSecret=${
				encodeURIComponent(import.meta.env.VITE_APP_SECRET)
			}&scopes=&state=${
				encodeURIComponent(JSON.stringify({
					redirect_path: window.location.href,
				}))
			}`, (tab, ev) => {
				const {accessToken, refreshToken} = ev.data;
				if (accessToken) {
					localStorage.setItem(AccessTokenStorageKey, accessToken);
					localStorage.setItem(RefreshTokenStorageKey, refreshToken);
					tab.close();
				}
			});
			await this.updateAuthStatus();
		} catch (error) {
			runInAction(() => {
				this.loginStatus = 'loggedOut';
			});
		}
	}

	// eslint-disable-next-line max-len
	public async saveTheme(name: string, configRaw: string, cover: File, id?: string | undefined): Promise<boolean> {
		const workspaceName = this.user?.workspaceName;
		if (!workspaceName) {
			return false;
		}
		try {
			const config = JSON.parse(configRaw);
			const url = getServerUrl('/api/ce/theme');
			const result = requestV1.unwrap(
				// eslint-disable-next-line no-spaced-func, func-call-spacing, max-len
				await requestV1.post<{id?: string, workspaceName: string; name: string; config: object; cover: {name: string; size: number; type: string}}, IThemeOnCloud>(url, {
					id,
					workspaceName,
					name,
					config,
					cover: {
						type: cover.type,
						name: cover.name,
						size: cover.size,
					},
				}),
			);
			const fileUploadRes = await fetch(result.cover.uploadUrl, {
				method: 'PUT',
				body: cover,
			});
			if (!fileUploadRes.ok) {
				throw new Error(await fileUploadRes.text());
			}
			const reportUploadSuccessApiUrl = getServerUrl('/api/ce/upload/callback');
			// eslint-disable-next-line function-paren-newline
			await requestV1.get<{ storageId: string; status: 1 }, { downloadUrl: string }>(
				reportUploadSuccessApiUrl, {storageId: result.cover.storageId, status: 1},
			// eslint-disable-next-line function-paren-newline
			);
			emitEvent('notification', {
				msg: 'Saved',
				type: MessageBarType.success,
			});
			await this.updateThemes(workspaceName);
			runInAction(() => {
				this.themeId = name;
			});
			return true;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
			emitEvent('notification', {
				msg: `Failed to save ${error}`,
				type: MessageBarType.error,
			});
			return false;
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const UserStoreContext = createContext<UserStore>(null!);

export const useUserStore = () => {
	const ctx = useContext(UserStoreContext);
	return ctx;
};

export const useUserStoreProvider = (): FC<PropsWithChildren> => {
	const userStore = useMemo(() => new UserStore(), []);

	return useCallback<FC<PropsWithChildren>>(({children}) => (
		<UserStoreContext.Provider value={userStore}>
			{children}
		</UserStoreContext.Provider>
	), [userStore]);
};
