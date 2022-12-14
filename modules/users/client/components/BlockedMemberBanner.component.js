/**
 * Banner that describes that user is blocked
 */

import '@/config/client/i18n';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import BlockMember from './BlockMember.component';
import ReportMember from '@/modules/support/client/components/ReportMember.component.js';

export default function BlockedMemberBanner({ username }) {
  const { t } = useTranslation('users');

  return (
    <div className="alert alert-warning" role="alert">
      <p>
        {t('You have blocked this member.')}{' '}
        {t('They cannot see or message you.')}
        <ReportMember username={username} className="btn btn-link" />
        <BlockMember isBlocked username={username} className="btn btn-link" />
      </p>
    </div>
  );
}

BlockedMemberBanner.propTypes = {
  username: PropTypes.string.isRequired,
};
