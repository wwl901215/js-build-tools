const NODE_ENV = 'int'
const name = 'wwl'
export function getConfig() {
  if (NODE_ENV === 'int') {
    return {
      appId: '123',
    }
  } else if (NODE_ENV === 'stg') {
    return {
      appId: '456',
    }
  } else {
    return {
      appId: '789',
    }
  }
}
