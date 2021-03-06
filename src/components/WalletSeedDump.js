import React from 'react'
import { translate } from 'react-i18next'
import { action, computed, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Input } from 'antd'

@translate(['wallet'], { wait: true })
@inject('rpc', 'wallet')
@observer
class WalletSeedDump extends React.Component {
  @observable error = false
  @observable seed = ''

  constructor (props) {
    super(props)
    this.t = props.t
    this.rpc = props.rpc
    this.wallet = props.wallet
  }

  /**
   * Get error status.
   * @function errorStatus
   * @return {string|false} Current error or false if none.
   */
  @computed
  get errorStatus () {
    if (this.error !== false) return this.error
    return false
  }

  /**
   * Set RPC error.
   * @function setError
   * @param {string} error - RPC error.
   */
  @action
  setError = (error = false) => {
    this.error = error
  }

  /**
   * Set wallet seed.
   * @function setSeed
   * @param {string} seed - Wallet seed.
   */
  @action
  setSeed = seed => {
    this.seed = seed
  }

  /**
   * Dump wallet seed.
   * @function dumpSeed
   */
  dumpSeed = () => {
    this.rpc.execute([{ method: 'dumpwalletseed', params: [] }], response => {
      /** Set seed. */
      if (response[0].hasOwnProperty('result') === true) {
        this.setSeed(response[0].result)
      }

      /** Set error. */
      if (response[0].hasOwnProperty('error') === true) {
        switch (response[0].error.code) {
          /** error_code_wallet_error */
          case -4:
            return this.setError('notDeterministic')
        }
      }
    })
  }

  render () {
    return (
      <div>
        <div className='flex'>
          <i className='material-icons md-16'>fingerprint</i>
          <p>{this.t('wallet:seedDumpLong')}</p>
        </div>
        <div className='flex-sb' style={{ margin: '10px 0 0 0' }}>
          <p style={{ width: '120px' }}>{this.t('wallet:seed')}</p>
          <Input
            disabled={this.seed === ''}
            readOnly
            style={{ flex: 1 }}
            value={this.seed}
          />
        </div>
        <div className='flex-sb' style={{ margin: '5px 0 0 0' }}>
          <p className='red' style={{ margin: '0 0 0 120px' }}>
            {this.errorStatus === 'notDeterministic' &&
              this.t('wallet:notDeterministic')}
          </p>
          <Button
            disabled={
              this.errorStatus !== false || this.wallet.isLocked === true
            }
            onClick={this.dumpSeed}
          >
            {this.t('wallet:seedDump')}
          </Button>
        </div>
      </div>
    )
  }
}

export default WalletSeedDump
