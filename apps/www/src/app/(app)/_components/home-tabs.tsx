'use client';

import { PlaygroundPreview } from '@/components/playground-preview';

const i18n = {
  cn: {
    customize: '定制',
    installation: '安装',
    playground: '操场',
  },
  en: {
    customize: 'Customize',
    installation: 'Installation',
    playground: 'Playground',
  },
};

// const InstallationTab = dynamic(() => import('./installation-tab'));

export default function HomeTabs() {
  // const locale = useLocale();
  // const content = i18n[locale as keyof typeof i18n];

  // const active = useStoreValue(SettingsStore, 'showSettings');
  // const homeTab = useStoreValue(SettingsStore, 'homeTab');
  // const [builder, setBuilder] = useQueryState(
  //   'builder',
  //   parseAsBoolean.withDefault(false)
  // );

  // useEffect(() => {
  //   if (builder) {
  //     SettingsStore.set('showSettings', true);
  //   }
  // }, [builder]);

  // useEffect(() => {
  //   if (active) {
  //     void setBuilder(true);
  //   } else {
  //     void setBuilder(false);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [active]);

  return (
    <div>
      <PlaygroundPreview />

      {/* <Tabs
        className="block"
        value={homeTab}
        onValueChange={(value) => {
          SettingsStore.set('homeTab', value);
        }}
      >
        <TabsList>
          <TabsTrigger value="playground">{content.playground}</TabsTrigger>
          <TabsTrigger value="installation">{content.installation}</TabsTrigger>
        </TabsList>

        <TabsContent className="pt-2" value="playground">
          <PlaygroundPreview className="" />
        </TabsContent>

        <TabsContent className="pt-2" value="installation">
          <div className="max-w-[1136px] p-4">
            <InstallationTab />
          </div>
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
