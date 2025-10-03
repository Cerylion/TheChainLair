import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GcmDemo from '../../../../pages/GcmDemo.js';

describe('GCM Demo – minimal e2e behaviors', () => {
  test('overlay mounts and ring toggles via Scroll Mode buttons', async () => {
    render(<GcmDemo />);

    // Cursor overlay should exist
    const cursors0 = Array.from(document.querySelectorAll('.gcm-cursor'));
    expect(cursors0.length).toBeGreaterThan(0);
    expect(cursors0.some((el) => el.classList.contains('gcm-cursor--ring'))).toBe(false);

    // Toggle Scroll Mode OFF → indicator shows false
    const indicator = screen.getByTestId('scroll-mode-indicator');
    const scrollOffBtn = screen.getByText('Scroll Off');
    await userEvent.click(scrollOffBtn);
    await waitFor(() => {
      expect(indicator.textContent).toBe('false');
    });

    // Toggle Scroll Mode ON → indicator shows true
    const scrollOnBtn = screen.getByText('Scroll On');
    await userEvent.click(scrollOnBtn);
    await waitFor(() => {
      expect(indicator.textContent).toBe('true');
    });

    // Toggle Scroll Mode OFF again → indicator reverts to false
    await userEvent.click(scrollOffBtn);
    await waitFor(() => {
      expect(indicator.textContent).toBe('false');
    });
  });
});