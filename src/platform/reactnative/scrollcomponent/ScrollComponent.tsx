import * as React from "react";
import {
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    View,
    Platform,
} from "react-native";
import BaseScrollComponent, { ScrollComponentProps } from "../../../core/scrollcomponent/BaseScrollComponent";
import TSCast from "../../../utils/TSCast";
import { CustomScrollView } from "react-native-nested-scroll-view_nghialt";
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */

export default class ScrollComponent extends BaseScrollComponent {

    public static defaultProps = {
        contentHeight: 0,
        contentWidth: 0,
        externalScrollView: TSCast.cast(CustomScrollView), //TSI
        isHorizontal: false,
        scrollThrottle: 16,
    };

    private _height: number;
    private _width: number;
    private _isSizeChangedCalledOnce: boolean;
    private _dummyOnLayout: (event: LayoutChangeEvent) => void;
    private _scrollViewRef: CustomScrollView | null;

    constructor(args: ScrollComponentProps) {
        super(args);
        this._onScroll = this._onScroll.bind(this);
        this._onLayout = this._onLayout.bind(this);

        this._height = 0;
        this._width = 0;

        this._isSizeChangedCalledOnce = false;
    }

    public scrollTo(x: number, y: number, isAnimated: boolean): void {
        if (this._scrollViewRef) {
            // @ts-ignore
            this._scrollViewRef.scrollTo({x, y, animated: isAnimated});
        }
    }

    public render(): JSX.Element {
        const Scroller = TSCast.cast<CustomScrollView>(this.props.externalScrollView); //TSI
        return (
            // @ts-ignore
            <Scroller ref={(scrollView: any) => this._scrollViewRef = scrollView as (CustomScrollView | null)}
                      removeClippedSubviews={false}
                      scrollEventThrottle={this.props.scrollThrottle}
                      {...this.props}
                      horizontal={this.props.isHorizontal}
                      onScroll={this._onScroll}
                      onLayout={(!this._isSizeChangedCalledOnce || this.props.canChangeSize) ? this._onLayout : this._dummyOnLayout}>
                <View style={{flexDirection: this.props.isHorizontal ? "row" : "column"}}>
                    <View style={{
                        height: this.props.contentHeight,
                        width: this.props.contentWidth,
                    }}>
                        {this.props.children}
                    </View>
                    {this.props.renderFooter ? this.props.renderFooter() : null}
                </View>
            </Scroller>
        );
    }

    private _onScroll(event?: NativeSyntheticEvent<NativeScrollEvent>): void {
        if (event) {
            this.props.onScroll(event.nativeEvent.contentOffset.x, event.nativeEvent.contentOffset.y, event);
        }
    }

    private _onLayout(event: LayoutChangeEvent): void {
        if (this._height !== event.nativeEvent.layout.height || this._width !== event.nativeEvent.layout.width) {
            this._height = event.nativeEvent.layout.height;
            this._width = event.nativeEvent.layout.width;
            if (this.props.onSizeChanged) {
                this._isSizeChangedCalledOnce = true;
                this.props.onSizeChanged(event.nativeEvent.layout);
            }
        }
    }
}
