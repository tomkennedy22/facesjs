import { useState } from "react";
import override from "../../src/override";
import { useStateStore } from "./stateStore";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  type useDisclosure,
  Select,
  SelectItem,
  Divider,
} from "@nextui-org/react";
import { getOverrideListForItem } from "./overrideList";
import { Face } from "../../src/Face";
import { deepCopy, getFromDict, setToDict } from "./utils";

const CompareFaceGrid = ({
  featureA,
  featureB,
}: {
  featureA: string;
  featureB: string;
}) => {
  const { gallerySectionConfigList, faceConfig, setFaceStore } =
    useStateStore();
  const featureAConfigItem = gallerySectionConfigList.find(
    (gallerySectionConfig) => gallerySectionConfig.key === featureA,
  );
  const featureBConfigItem = gallerySectionConfigList.find(
    (gallerySectionConfig) => gallerySectionConfig.key === featureB,
  );

  if (!featureAConfigItem || !featureBConfigItem) {
    return null;
  }

  let featureAOverrideList = getOverrideListForItem(featureAConfigItem);
  let featureBOverrideList = getOverrideListForItem(featureBConfigItem);

  if (featureBOverrideList.length > featureAOverrideList.length) {
    [featureAOverrideList, featureBOverrideList] = [
      featureBOverrideList,
      featureAOverrideList,
    ];
  }

  const columns = featureBOverrideList.length;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: "1rem",
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      style={gridStyle}
    >
      {featureAOverrideList.flatMap((featureAOverride, indexA) =>
        featureBOverrideList.map((featureBOverride, indexB) => {
          const faceConfigCopy = deepCopy(faceConfig);
          let faceOverride = {};
          setToDict(faceOverride, featureA, featureAOverride.value);
          setToDict(faceOverride, featureB, featureBOverride.value);
          override(faceConfigCopy, faceOverride);
          const selected =
            getFromDict(faceConfig, featureA) === featureAOverride.value &&
            getFromDict(faceConfig, featureB) === featureBOverride.value;

          const faceIndex = indexA * columns + indexB;
          return (
            <div
              key={faceIndex}
              className={`rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center active:scale-90 transition-transform ease-in-out${selected ? " bg-slate-200 hover:border-slate-500" : ""}`}
              onClick={() => {
                setFaceStore(faceConfigCopy);
              }}
            >
              <Face face={faceConfigCopy} style={{ width: "150px" }} lazy />
            </div>
          );
        }),
      )}
    </div>
  );
};

export const CompareFaceModal = ({
  modalDisclosure,
}: {
  modalDisclosure: ReturnType<typeof useDisclosure>;
}) => {
  const { isOpen, onOpenChange } = modalDisclosure;

  const { gallerySectionConfigList } = useStateStore();

  const [firstSelectInvalid, setFirstSelectInvalid] = useState(true);
  const [secondSelectInvalid, setSecondSelectInvalid] = useState(true);

  const [firstSelectChoice, setFirstSelectChoice] = useState<string>("");
  const [secondSelectChoice, setSecondSelectChoice] = useState<string>("");

  return (
    <Modal
      shadow="md"
      size="5xl"
      // className='min-w-2/3'
      // style={{ width: '90%', maxWidth: '90%' }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(_) => (
          <>
            <ModalHeader>Compare face configs</ModalHeader>
            <ModalBody className="overflow-y-visible">
              <div className="flex justify-start gap-4 h-full">
                <Select
                  label="First feature"
                  className="max-w-xs"
                  isInvalid={firstSelectInvalid}
                  selectedKeys={[firstSelectChoice]}
                  onChange={(e) => {
                    setFirstSelectChoice(e.target.value);
                    setFirstSelectInvalid(false);
                  }}
                >
                  {gallerySectionConfigList.map((gallerySectionConfig) => (
                    <SelectItem
                      key={gallerySectionConfig.key}
                      value={gallerySectionConfig.key}
                      isDisabled={
                        gallerySectionConfig.key === secondSelectChoice
                      }
                    >
                      {gallerySectionConfig.text}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Second feature"
                  className="max-w-xs"
                  isInvalid={secondSelectInvalid}
                  selectedKeys={[secondSelectChoice]}
                  onChange={(e) => {
                    setSecondSelectChoice(e.target.value);
                    setSecondSelectInvalid(false);
                  }}
                >
                  {gallerySectionConfigList.map((gallerySectionConfig) => (
                    <SelectItem
                      key={gallerySectionConfig.key}
                      value={gallerySectionConfig.key}
                      isDisabled={
                        gallerySectionConfig.key === firstSelectChoice
                      }
                    >
                      {gallerySectionConfig.text}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <Divider />
            {!(firstSelectInvalid || secondSelectInvalid) ? (
              <ModalBody className="">
                <CompareFaceGrid
                  featureA={firstSelectChoice}
                  featureB={secondSelectChoice}
                />
              </ModalBody>
            ) : (
              <ModalBody className="">
                <p>Please select two different features</p>
              </ModalBody>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
