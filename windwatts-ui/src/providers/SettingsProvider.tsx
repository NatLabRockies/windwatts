import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from "react";
import {
  SettingsContext,
  defaultValues,
  CurrentPosition,
  StoredSettings,
} from "./SettingsContext";
import { UnitsContext } from "./UnitsContext";
import { DataModel } from "../types";
import { percentToFactor, isCustomTurbineId } from "../utils";
import { useCustomTurbines } from "../hooks/useCustomTurbines";
import { useToast } from "../hooks/useToast";
import {
  parseUrlParams,
  buildUrlFromSettings,
  hasLaunchParams,
  URL_PARAM_DEFAULTS,
} from "../utils/urlParams";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { updateUnit } = useContext(UnitsContext);
  const { showToast } = useToast();

  // Parse URL params once and cache the result
  const urlParamsRef = useRef(parseUrlParams());

  const [settings, setSettings] = useState<StoredSettings>(() => {
    const urlParams = urlParamsRef.current;

    if (hasLaunchParams(urlParams)) {
      return {
        ...defaultValues,
        currentPosition: {
          lat: urlParams.lat!,
          lng: urlParams.lng!,
        },
        zoom: urlParams.zoom ?? URL_PARAM_DEFAULTS.zoom,
        hubHeight: urlParams.hubHeight ?? URL_PARAM_DEFAULTS.hubHeight,
        turbine: urlParams.turbine ?? URL_PARAM_DEFAULTS.turbine,
        preferredModel: urlParams.dataModel ?? URL_PARAM_DEFAULTS.dataModel,
        lossAssumptionFactor:
          urlParams.lossAssumption !== undefined
            ? percentToFactor(urlParams.lossAssumption)
            : defaultValues.lossAssumptionFactor,
        windspeedUnit:
          urlParams.windspeedUnit ?? URL_PARAM_DEFAULTS.windspeedUnit,
      };
    }

    return {
      ...defaultValues,
      currentPosition: null,
    };
  });

  const resolveInitialTurbine = useCallback(
    (requested: string, resolved: string) => {
      setSettings((current) =>
        current.turbine === requested
          ? { ...current, turbine: resolved }
          : current
      );
    },
    []
  );

  const {
    customCurves,
    addCustomCurve,
    removeCustomCurve,
    ready,
    hasMultipleMatches,
  } = useCustomTurbines(
    hasLaunchParams(urlParamsRef.current) &&
      isCustomTurbineId(urlParamsRef.current.turbine ?? "")
      ? urlParamsRef.current.turbine
      : undefined,
    resolveInitialTurbine
  );

  useEffect(() => {
    if (hasMultipleMatches) {
      showToast({
        message:
          "Multiple curves match this shared link. Using the oldest import.",
        severity: "warning",
      });
    }
  }, [hasMultipleMatches, showToast]);

  useEffect(() => {
    const urlParams = urlParamsRef.current;
    if (urlParams.windspeedUnit) {
      updateUnit("windspeed", urlParams.windspeedUnit);
    }
  }, [updateUnit]);

  useEffect(() => {
    if (!settings.currentPosition || !ready) {
      return;
    }

    const url = buildUrlFromSettings({
      currentPosition: settings.currentPosition,
      hubHeight: settings.hubHeight,
      turbine: settings.turbine,
      customCurves,
      preferredModel: settings.preferredModel,
      lossAssumptionPercent: Math.round(
        (1 - settings.lossAssumptionFactor) * 100
      ),
      zoom: settings.zoom,
      windspeedUnit: settings.windspeedUnit,
    });

    if (url !== "/") {
      window.history.replaceState({}, "", url);
    }
  }, [
    settings.currentPosition,
    settings.zoom,
    settings.hubHeight,
    settings.turbine,
    settings.preferredModel,
    settings.lossAssumptionFactor,
    settings.windspeedUnit,
    customCurves,
    ready,
  ]);

  const setCurrentPosition = useCallback(
    (
      position:
        | CurrentPosition
        | null
        | ((prev: CurrentPosition | null) => CurrentPosition | null)
    ) => {
      setSettings((current) => ({
        ...current,
        currentPosition:
          typeof position === "function"
            ? position(current.currentPosition)
            : position,
      }));
    },
    []
  );

  const setZoom = useCallback((zoom: number) => {
    const rounded = Math.round(zoom);
    setSettings((current) => ({ ...current, zoom: rounded }));
  }, []);

  const setHubHeight = useCallback((height: number) => {
    setSettings((current) => ({ ...current, hubHeight: height }));
  }, []);

  const setTurbine = useCallback(
    (turbine: string) => {
      setSettings((current) => ({ ...current, turbine }));
    },
    [setSettings]
  );

  const setPreferredModel = useCallback(
    (model: DataModel) => {
      setSettings((current) => ({ ...current, preferredModel: model }));
    },
    [setSettings]
  );

  const setLossAssumptionFactor = useCallback(
    (factor: number) => {
      const clamped = Math.max(0, Math.min(1, Number(factor)));
      setSettings((current) => ({ ...current, lossAssumptionFactor: clamped }));
    },
    [setSettings]
  );

  const setLossAssumptionPercent = useCallback(
    (percent: number) => {
      const factor = percentToFactor(percent);
      setLossAssumptionFactor(factor);
    },
    [setLossAssumptionFactor]
  );

  const setWindspeedUnit = useCallback(
    (unit: string) => {
      setSettings((current) => ({ ...current, windspeedUnit: unit }));
    },
    [setSettings]
  );

  // Toggle functions that update the settings directly
  const toggleSettings = useCallback(() => {
    setSettings((current) => ({
      ...current,
      settingsOpen: !current.settingsOpen,
    }));
  }, [setSettings]);

  const toggleResults = useCallback(() => {
    setSettings((current) => ({
      ...current,
      resultsOpen: !current.resultsOpen,
    }));
  }, [setSettings]);

  // Memoize the provider value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      settingsOpen: settings.settingsOpen,
      toggleSettings,
      resultsOpen: settings.resultsOpen,
      toggleResults,
      currentPosition: settings.currentPosition,
      setCurrentPosition,
      zoom: settings.zoom,
      setZoom,
      hubHeight: settings.hubHeight,
      setHubHeight,
      turbine: settings.turbine,
      setTurbine,
      preferredModel: settings.preferredModel,
      setPreferredModel,
      customCurves,
      addCustomCurve,
      removeCustomCurve,
      lossAssumptionFactor:
        settings.lossAssumptionFactor ?? defaultValues.lossAssumptionFactor,
      lossAssumptionPercent: Math.round(
        (1 -
          (settings.lossAssumptionFactor ??
            defaultValues.lossAssumptionFactor)) *
          100
      ),
      setLossAssumptionFactor,
      setLossAssumptionPercent,
      windspeedUnit: settings.windspeedUnit,
      setWindspeedUnit,
    }),
    [
      settings.settingsOpen,
      settings.resultsOpen,
      settings.currentPosition,
      settings.zoom,
      settings.hubHeight,
      settings.turbine,
      settings.preferredModel,
      settings.lossAssumptionFactor,
      settings.windspeedUnit,
      customCurves,
      toggleSettings,
      toggleResults,
      setCurrentPosition,
      setZoom,
      setHubHeight,
      setTurbine,
      setPreferredModel,
      addCustomCurve,
      removeCustomCurve,
      setLossAssumptionFactor,
      setLossAssumptionPercent,
      setWindspeedUnit,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
