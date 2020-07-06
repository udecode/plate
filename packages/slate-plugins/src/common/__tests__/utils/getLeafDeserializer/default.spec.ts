import { MARK_BOLD } from '../../../../marks/bold/types';
import { getLeafDeserializer } from '../../../utils/getLeafDeserializer';

it('should be', () => {
  expect(getLeafDeserializer(MARK_BOLD)[MARK_BOLD]).toBeDefined();
});
