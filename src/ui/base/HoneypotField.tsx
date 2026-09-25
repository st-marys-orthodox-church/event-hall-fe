import { HONEYPOT_FIELD } from '../../utils/Honeypot';

type HoneypotFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Off-screen text input that people never see or tab into. Anything typed here marks the
 * submission as automated on the server.
 */
export const HoneypotField = ({ value, onChange }: HoneypotFieldProps) => (
  <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
    <input
      type="text"
      name={HONEYPOT_FIELD}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      data-lpignore="true"
      data-1p-ignore
    />
  </div>
);
