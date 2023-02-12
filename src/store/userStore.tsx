import {
	type IReactionDisposer, makeAutoObservable, reaction, runInAction, observable,
} from 'mobx';
import React, {
	createContext, FC, useCallback, useContext, useMemo, PropsWithChildren,
} from 'react';
import {defaultThemes, themeConfigList} from '../utils/loadVegaResource';
import request, {getServerUrl} from '../utils/request';

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
	configs: string;
	previewSrc: string;
	isDefault?: boolean;
}

export default class UserStore {
	public loginStatus: 'pending' | 'loggedIn' | 'loggedOut';

	public user: IUserInfo | null;

	public themes: readonly ITheme[] = [];

	// eslint-disable-next-line class-methods-use-this
	public get defaultThemes() {
		return defaultThemes.map(thm => ({...thm, isDefault: true}));
	}

	public get allThemes() {
		return [...this.themes, ...this.defaultThemes];
	}

	public themeName = Object.keys(themeConfigList)[0];

	public get curTheme() {
		return this.allThemes.find(thm => thm.name === this.themeName) ?? null;
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
					this.updateThemes();
				}
			}),
			reaction(() => this.themes, () => {
				if (!this.allThemes.find(thm => thm.name === this.themeName)) {
					this.themeName = this.defaultThemes[0].name;
				}
			}),
			reaction(() => this.themeName, themeName => {
				if (!this.allThemes.find(thm => thm.name === themeName)) {
					this.themeName = this.defaultThemes[0].name;
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

	public setTheme(themeName: string) {
		if (this.allThemes.find(thm => thm.name === themeName)) {
			this.themeName = themeName;
		}
	}

	protected async updateUserInfo() {
		try {
			if (this.loginStatus !== 'loggedIn') {
				return;
			}
			const url = getServerUrl('/api/ce/personal');
			const result = await request.get<never, IUserInfo>(url);
			if (result !== null) {
				runInAction(() => {
					this.user = result;
					if (!result.avatarURL) {
						this.customAvatar({
							isDefaultAvatar: true,
							defaultAvatarUrl: 'https://foghorn-assets.s3.ap-northeast-1.amazonaws.com/avatar/small/avatar-B-01.png',
						});
						return;
					}
					this.user.avatarURL = result.avatarURL;
				});
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}

	public async updateThemes() {
		try {
			runInAction(() => {
				this.themes = [];
			});
			if (this.loginStatus !== 'loggedIn') {
				return;
			}
			const url = getServerUrl('/api/ce/theme/list');
			const result = await request.get<never, { themeList: ITheme[] }>(url);
			if (result !== null) {
				runInAction(() => {
					this.themes = result.themeList;
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
			const url = getServerUrl('/api/loginStatus');
			const res = await request.get<never, { loginStatus: boolean; userName: string }>(url);
			runInAction(() => {
				this.loginStatus = res.loginStatus ? 'loggedIn' : 'loggedOut';
			});
			return res.loginStatus;
		} catch (error) {
			runInAction(() => {
				this.loginStatus = 'loggedOut';
			});
			return null;
		}
	}

	public async signUp(): Promise<void> {
		runInAction(() => {
			this.loginStatus = 'pending';
		});
		const url = `${KanariesPath}/access?redirect_path=${encodeURIComponent(window.location.toString())}&redirect_close=1`;

		const directed = await new Promise<boolean>(resolve => {
			// Most browsers block popups if they are called
			// outside of user-triggered event handlers like onclick.
			const button = document.createElement('button');
			button.onclick = () => {
				const officialSite = window.open(url);
				if (officialSite) {
					const beginTime = Date.now();
					const cb = (): void => {
						if (officialSite.closed) {
							resolve(true);
							return;
						}
						if (Date.now() - beginTime > 1_000 * 60 * 10) {
							resolve(false);
							return;
						}
						setTimeout(cb, 200);
					};
					setTimeout(cb, 200);
				} else {
					resolve(false);
				}
			};
			button.click();
		});
		if (directed) {
			await this.updateAuthStatus();
		} else {
			runInAction(() => {
				this.loginStatus = 'loggedOut';
			});
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
