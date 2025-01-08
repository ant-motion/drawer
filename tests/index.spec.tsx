import { cleanup, fireEvent, render, act } from '@testing-library/react';
import KeyCode from 'rc-util/lib/KeyCode';
import { resetWarned } from 'rc-util/lib/warning';
import React from 'react';
import type { DrawerProps } from '../src';
import Drawer from '../src';

describe('rc-drawer-menu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  it('single drawer', () => {
    const { unmount } = render(<Drawer open />);
    const drawer = document.querySelector('.rc-drawer');
    expect(drawer).toBeTruthy();
    expect(document.querySelector('.rc-drawer-open')).toBeTruthy();
    expect(document.body.contains(drawer)).toBeTruthy();
    unmount();
  });

  it('switch open drawer', () => {
    const { rerender } = render(<Drawer />);
    expect(document.querySelector('.rc-drawer')).toBeFalsy();

    rerender(<Drawer open />);
    expect(document.querySelector('.rc-drawer')).toBeTruthy();

    rerender(<Drawer />);
    act(() => {
      jest.runAllTimers();
    });
    expect(
      document.querySelector('.rc-drawer-content-wrapper-hidden'),
    ).toBeTruthy();
  });

  it('default props should work', () => {
    const { container, unmount } = render(
      <Drawer
        open
        placement={undefined}
        width={undefined}
        getContainer={false}
      />,
    );
    expect(container.querySelector('.rc-drawer-right')).toBeTruthy();
    expect(
      container.querySelector<HTMLDivElement>('.rc-drawer-content-wrapper')
        .style.width,
    ).toBe('378px');
    unmount();
  });

  describe('push', () => {
    const placementList: {
      placement: DrawerProps['placement'];
      transform: string;
    }[] = [
      {
        placement: 'left',
        transform: 'translateX(903px)',
      },
      {
        placement: 'right',
        transform: 'translateX(-903px)',
      },
      {
        placement: 'top',
        transform: 'translateY(903px)',
      },
      {
        placement: 'bottom',
        transform: 'translateY(-903px)',
      },
    ];

    placementList.forEach(({ placement, transform }) => {
      it(placement, () => {
        const { unmount } = render(
          <Drawer
            push={{ distance: 903 }}
            rootClassName="outer"
            open
            placement={placement}
          >
            <Drawer open />
          </Drawer>,
        );

        expect(
          document.body
            .querySelector('.outer')
            .querySelector('.rc-drawer-content-wrapper'),
        ).toHaveStyle({
          transform,
        });

        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });

        unmount();

        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });
      });
    });

    it('disable push', () => {
      const { container } = render(
        <Drawer push={false} open getContainer={false}>
          <Drawer open />
        </Drawer>,
      );

      expect(container.querySelector('.rc-drawer-content-wrapper')).toHaveStyle(
        {
          transform: '',
        },
      );
    });

    it('truthy', () => {
      const { container } = render(
        <Drawer push open getContainer={false}>
          <Drawer open />
        </Drawer>,
      );

      expect(container.querySelector('.rc-drawer-content-wrapper')).toHaveStyle(
        {
          transform: 'translateX(-180px)',
        },
      );
    });
  });

  describe('mask', () => {
    it('not lock body scroll when getContainer is not body', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      const { unmount } = render(<Drawer open getContainer={() => div} />);
      const drawer = document.querySelector('.rc-drawer');
      expect(drawer).toBeTruthy();
      expect(document.body.contains(drawer)).toBeTruthy();
      expect(document.body).not.toHaveStyle({
        overflowY: 'hidden',
      });
      unmount();
    });
    it('lock body scroll when getContainer give document.body', () => {
      const { unmount } = render(
        <Drawer open getContainer={() => document.body} />,
      );
      const drawer = document.querySelector('.rc-drawer');
      expect(drawer).toBeTruthy();
      expect(document.body.contains(drawer)).toBeTruthy();
      expect(document.body).toHaveStyle({
        overflowY: 'hidden',
      });
      unmount();
    });

    it('maskClosable', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer open onClose={onClose} getContainer={false} />,
      );
      fireEvent.click(container.querySelector('.rc-drawer-mask'));
      expect(onClose).toHaveBeenCalled();
    });

    it('maskClosable false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer
          open
          onClose={onClose}
          getContainer={false}
          maskClosable={false}
        />,
      );
      fireEvent.click(container.querySelector('.rc-drawer-mask'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('forceRender', () => {
    render(<Drawer forceRender />);
    expect(document.querySelector('.rc-drawer')).toBeTruthy();
  });

  describe('destroyOnClose', () => {
    it('basic', () => {
      const { rerender } = render(<Drawer destroyOnClose open />);
      expect(document.querySelector('.rc-drawer')).toBeTruthy();
      rerender(<Drawer destroyOnClose />);
      expect(document.querySelector('.rc-drawer')).toBeFalsy();
    });

    it('inline', () => {
      const { container, rerender } = render(
        <Drawer destroyOnClose open getContainer={false} />,
      );
      expect(container.querySelector('.rc-drawer')).toBeTruthy();
      rerender(<Drawer destroyOnClose getContainer={false} />);
      expect(container.querySelector('.rc-drawer')).toBeFalsy();
    });
  });

  describe('placement', () => {
    (['left', 'right', 'top', 'bottom'] as const).forEach(placement => {
      it(placement, () => {
        render(<Drawer placement={placement} open />);
        expect(document.querySelector(`.rc-drawer-${placement}`)).toBeTruthy();
      });
    });

    it('change placement', () => {
      const { rerender } = render(<Drawer placement="left" open />);
      expect(document.querySelector(`.rc-drawer-left`)).toBeTruthy();

      rerender(<Drawer placement="right" open />);
      expect(document.querySelector(`.rc-drawer-right`)).toBeTruthy();
    });
  });

  describe('getContainer', () => {
    it('element', () => {
      const holder = document.createElement('div');
      render(<Drawer open getContainer={holder} />);
      expect(holder.querySelector('.rc-drawer')).toBeTruthy();
    });

    it('false', () => {
      const { container } = render(
        <div className="holder">
          <Drawer getContainer={false} open />
        </div>,
      );

      expect(
        container.querySelector('.holder').querySelector('.rc-drawer'),
      ).toBeTruthy();
    });

    it('function', () => {
      const holder = document.createElement('div');
      render(<Drawer open getContainer={() => holder} />);
      expect(holder.querySelector('.rc-drawer')).toBeTruthy();
    });
  });

  it('styles.wrapper', () => {
    render(<Drawer styles={{ wrapper: { background: '#f00' } }} open />);

    expect(document.querySelector('.rc-drawer-content-wrapper')).toHaveStyle({
      background: '#f00',
    });
  });

  it('autoFocus', async () => {
    const { container } = render(
      <Drawer autoFocus open getContainer={false} />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.contains(document.activeElement)).toBeTruthy();
  });

  it('tab should always in the content', () => {
    const { container } = render(
      <Drawer open getContainer={false}>
        <div>Hello World</div>
      </Drawer>,
    );

    const firstSentinel = container.querySelector<HTMLElement>(
      '[data-sentinel="start"]',
    );
    const lastSentinel = container.querySelector<HTMLElement>(
      '[data-sentinel="end"]',
    );

    // First shift to last
    firstSentinel.focus();
    fireEvent.keyDown(firstSentinel, {
      shiftKey: true,
      keyCode: KeyCode.TAB,
      which: KeyCode.TAB,
    });
    expect(document.activeElement).toBe(lastSentinel);

    // Last tab to first
    fireEvent.keyDown(lastSentinel, {
      keyCode: KeyCode.TAB,
      which: KeyCode.TAB,
    });
    expect(document.activeElement).toBe(firstSentinel);
  });

  describe('keyboard', () => {
    it('ESC to exit', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer open getContainer={false} onClose={onClose} />,
      );
      fireEvent.keyDown(container.querySelector('.rc-drawer-section'), {
        keyCode: KeyCode.ESC,
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('disable ESC to exit', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer open getContainer={false} onClose={onClose} keyboard={false} />,
      );
      fireEvent.keyDown(container.querySelector('.rc-drawer-section'), {
        keyCode: KeyCode.ESC,
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('zIndex', () => {
    const { container } = render(
      <Drawer zIndex={93} open getContainer={false} />,
    );

    expect(container.querySelector('.rc-drawer')).toHaveStyle({
      zIndex: 93,
    });
  });

  it('width on the correct element', () => {
    resetWarned();
    const errSpy = jest.spyOn(console, 'error');
    const { container } = render(
      <Drawer width="93%" open getContainer={false} />,
    );

    expect(container.querySelector('.rc-drawer-content-wrapper')).toHaveStyle({
      width: '93%',
    });

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('warning for string width', () => {
    resetWarned();
    const errSpy = jest.spyOn(console, 'error');
    const { container } = render(
      <Drawer width="93" open getContainer={false} />,
    );

    expect(container.querySelector('.rc-drawer-content-wrapper')).toHaveStyle({
      width: '93px',
    });

    expect(errSpy).toHaveBeenCalledWith(
      'Warning: Invalid value type of `width` or `height` which should be number type instead.',
    );
    errSpy.mockRestore();
  });

  it('pass data props to internal div', () => {
    const value = 'bamboo';
    const { unmount } = render(<Drawer open data-attr={value} />);
    expect(
      document.querySelector('.rc-drawer-content-wrapper'),
    ).toHaveAttribute('data-attr', value);
    unmount();
  });

  it('support bodyProps', () => {
    const enter = jest.fn();
    const leave = jest.fn();
    const { baseElement } = render(
      <Drawer width="93" open onMouseEnter={enter} onMouseLeave={leave} />,
    );
    fireEvent.mouseOver(baseElement.querySelector('.rc-drawer-section'));
    expect(enter).toHaveBeenCalled();
    fireEvent.mouseLeave(baseElement.querySelector('.rc-drawer-section'));
    expect(leave).toHaveBeenCalled();
  });

  it('pass id & className props to Panel', () => {
    const { unmount } = render(
      <Drawer className="customer-className" id="customer-id" open />,
    );
    expect(document.querySelector('.rc-drawer-section')).toHaveClass(
      'customer-className',
    );
    expect(document.querySelector('.rc-drawer-section')).toHaveAttribute(
      'id',
      'customer-id',
    );
    unmount();
  });

  it('passes aria-describedby to the Panel', () => {
    const description = 'some meaningful description';
    const { unmount, getByRole } = render(
      <Drawer open aria-describedby={description} />,
    );
    expect(getByRole('dialog')).toHaveAttribute(
      'aria-describedby',
      description,
    );
    unmount();
  });

  it('passes aria-labelledby to the Panel', () => {
    const titleId = 'some-id';
    const { unmount, getByRole } = render(
      <Drawer open aria-labelledby={titleId}>
        <h1 id={titleId}>Some Title</h1>
      </Drawer>,
    );
    expect(getByRole('dialog')).toHaveAttribute('aria-labelledby', titleId);
    expect(
      getByRole('dialog', {
        name: 'Some Title',
      }),
    ).toBeVisible();
    unmount();
  });

  it('should support classNames', () => {
    const { unmount } = render(
      <Drawer
        classNames={{
          wrapper: 'customer-wrapper',
          mask: 'customer-mask',
          section: 'customer-section',
        }}
        open
      />,
    );
    expect(document.querySelector('.rc-drawer-content-wrapper')).toHaveClass(
      'customer-wrapper',
    );
    expect(document.querySelector('.rc-drawer-mask')).toHaveClass(
      'customer-mask',
    );
    expect(document.querySelector('.rc-drawer-section')).toHaveClass(
      'customer-section',
    );
    unmount();
  });
  it('should support styles', () => {
    const { unmount } = render(
      <Drawer
        styles={{
          wrapper: { background: 'red' },
          mask: { background: 'blue' },
          section: { background: 'green' },
        }}
        open
      />,
    );
    expect(document.querySelector('.rc-drawer-content-wrapper')).toHaveStyle(
      'background: red',
    );
    expect(document.querySelector('.rc-drawer-mask')).toHaveStyle(
      'background: blue',
    );
    expect(document.querySelector('.rc-drawer-section')).toHaveStyle(
      'background: green',
    );
    unmount();
  });
  it('should support drawerRender', () => {
    const { unmount } = render(
      <Drawer drawerRender={dom => <div id="test">{dom}</div>} open />,
    );
    expect(document.querySelector('#test')).toBeTruthy();
    unmount();
  });
});
