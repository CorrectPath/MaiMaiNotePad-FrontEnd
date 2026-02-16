import apiClient from './index'

export const getTranslationDictionary = () => {
  return apiClient.get('/dictionary/translation')
}

