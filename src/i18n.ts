import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';

i18n
	// 检测用户当前使用的语言
	.use(LanguageDetector)
	// 注入 react-i18next 实例
	.use(initReactI18next)
	// 初始化 i18next
	.init({
		debug: true,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
		returnNull: false,
		resources: {
			en: {
				translation: en,
			},
			zh: {
				translation: zh,
			},
		},
	});

export default i18n;
