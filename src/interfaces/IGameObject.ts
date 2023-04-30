export interface IGameObject {
  body: MatterJS.BodyType;
  spineObject: SpineGameObject;
  destroy: Function;
  stopListeningForEvents: Function;
  canBeGrabbed: Function;
}
