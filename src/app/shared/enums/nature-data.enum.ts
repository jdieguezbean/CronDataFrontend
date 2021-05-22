// Class to enum data nature
export enum NatureDataPrefixEnum {
  CORRELATION = 'correlation.',
  GLOBAL = 'global.',
  VULNERABILITY = 'vulnerability.',
  TIMESTAMP = '@timestamp',
  ALERT = 'alert.',
  EVENT = 'logx.'
}

export enum DataNatureTypeEnum {
  ALERT = 'EVENT',
  EVENT = 'LOGX',
  VULNERABILITY = 'VULNERABILITY'
}
