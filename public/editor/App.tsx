import { NextUIProvider, useDisclosure } from "@nextui-org/react";
import { FeatureGallery } from "./FeatureGallery";
import { TopBar } from "./TopBar";
import { MainFace } from "./MainFace";
import { EditJsonModal } from "./EditJsonModal";
import { Credits } from "./Credits";
import { CompareFaceModal } from "./CompareFaceModal";

const App = () => {
  const uploadModalDisclosure = useDisclosure();
  const compareModalDisclosure = useDisclosure();

  return (
    <NextUIProvider>
      <TopBar />
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start pt-16 gap-2 mx-2">
        <FeatureGallery />
        <div className="md:sticky md:top-16 flex-shrink-0 w-[280px] lg:w-[350px] xl:w-[400px] flex flex-col h-full">
          <MainFace
            uploadModalDisclosure={uploadModalDisclosure}
            compareModalDisclosure={compareModalDisclosure}
          />

          <div className="hidden md:block mt-6">
            <Credits />
          </div>
        </div>
      </div>
      <EditJsonModal modalDisclosure={uploadModalDisclosure} />
      <CompareFaceModal modalDisclosure={compareModalDisclosure} />
      <div className="md:hidden mb-2 mx-2">
        <Credits />
      </div>
    </NextUIProvider>
  );
};

export default App;
