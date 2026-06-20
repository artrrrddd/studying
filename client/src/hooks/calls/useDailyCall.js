import { useCallback, useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';

let sharedCallObject = null;
let releaseTimer = null;
let activeRoomUrl = null;

function clearReleaseTimer() {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
}

function getSharedCallObject() {
  clearReleaseTimer();

  const existing =
    typeof DailyIframe.getCallInstance === 'function'
      ? DailyIframe.getCallInstance()
      : null;

  if (existing) {
    sharedCallObject = existing;
    return existing;
  }

  if (!sharedCallObject) {
    sharedCallObject = DailyIframe.createCallObject();
  }

  return sharedCallObject;
}

function releaseSharedCallObject(daily) {
  if (!daily || sharedCallObject !== daily) {
    return;
  }

  clearReleaseTimer();
  releaseTimer = setTimeout(() => {
    releaseTimer = null;

    if (sharedCallObject === daily) {
      daily.leave().catch(() => {});
      activeRoomUrl = null;
    }
  }, 500);
}

function isMeetingInProgress(callObject) {
  const meetingState = callObject.meetingState?.();
  return (
    meetingState === 'joining-meeting' || meetingState === 'joined-meeting'
  );
}

export function useDailyCall(joinRequest) {
  const [callObject, setCallObject] = useState(null);
  const [joinData, setJoinData] = useState(null);
  const [error, setError] = useState(null);
  const joinedRef = useRef(false);
  const callObjectRef = useRef(null);

  useEffect(() => {
    let daily;

    try {
      daily = getSharedCallObject();
    } catch (e) {
      setError(e);
      return undefined;
    }

    callObjectRef.current = daily;
    setCallObject(daily);

    return () => {
      joinedRef.current = false;
      if (callObjectRef.current === daily) {
        callObjectRef.current = null;
      }

      releaseSharedCallObject(daily);
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    async function join() {
      if (
        !callObject ||
        !joinRequest ||
        joinedRef.current ||
        callObjectRef.current !== callObject
      ) {
        return;
      }

      joinedRef.current = true;
      setJoinData(null);
      setError(null);

      let data;

      try {
        data = await joinRequest();
        if (disposed || callObjectRef.current !== callObject) {
          return;
        }

        const sameRoomIsActive =
          activeRoomUrl === data.roomUrl && isMeetingInProgress(callObject);

        if (!sameRoomIsActive) {
          if (isMeetingInProgress(callObject)) {
            await callObject.leave().catch(() => {});
            activeRoomUrl = null;
          }

          if (disposed || callObjectRef.current !== callObject) {
            return;
          }

          activeRoomUrl = data.roomUrl;

          await callObject.join({
            url: data.roomUrl,
            token: data.token,
            userName: data.user?.name || data.user?.email || 'User',
          });
        }

        if (!disposed && callObjectRef.current === callObject) {
          setJoinData(data);
        }
      } catch (e) {
        if (activeRoomUrl === data?.roomUrl) {
          activeRoomUrl = null;
        }

        if (!disposed && callObjectRef.current === callObject) {
          setError(e);
          joinedRef.current = false;
        }
      }
    }

    join();

    return () => {
      disposed = true;
    };
  }, [callObject, joinRequest]);

  const leave = useCallback(async () => {
    joinedRef.current = false;
    clearReleaseTimer();
    await callObjectRef.current?.leave();
    activeRoomUrl = null;
  }, []);

  return {
    callObject,
    joinData,
    error,
    leave,
  };
}
