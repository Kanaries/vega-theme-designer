import React, {
	createContext, FC, useCallback, useContext, useMemo, PropsWithChildren,
} from 'react';

export default class UserStore {
	userName: string | null;

	constructor() {
		this.userName = null;
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
